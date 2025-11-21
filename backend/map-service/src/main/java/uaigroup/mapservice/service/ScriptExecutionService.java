package uaigroup.mapservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uaigroup.mapservice.model.*;
import uaigroup.mapservice.repository.ScriptActionRepository;
import uaigroup.mapservice.repository.ScriptRepository;
import uaigroup.mapservice.repository.UnitRepository;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class ScriptExecutionService {

    @Autowired
    private ScriptRepository scriptRepository;

    @Autowired
    private ScriptActionRepository scriptActionRepository;

    @Autowired
    private UnitRepository unitRepository;

    @Autowired
    private CommunicationService communicationService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Main scheduler that processes all active scripts
     * Runs every 5 seconds
     */
    @Scheduled(fixedRate = 5000)
    public void processActiveScripts() {
        List<Script> activeScripts = scriptRepository.findByIsActiveTrue();

        for (Script script : activeScripts) {
            if (!script.isPaused()) {
                processScript(script);
            }
        }
    }

    /**
     * Process a single script
     */
    private void processScript(Script script) {
        // Update elapsed time
        if (script.getStartedAt() != null) {
            long elapsed = ChronoUnit.SECONDS.between(script.getStartedAt(), LocalDateTime.now());
            script.setElapsedSeconds((int) elapsed);
        }

        // Get pending actions for this script
        List<ScriptAction> pendingActions = scriptActionRepository.findByScriptIdAndStatus(
                script.getId(), ActionStatus.PENDING
        );

        for (ScriptAction action : pendingActions) {
            if (shouldExecuteAction(script, action)) {
                executeAction(script, action);
            }
        }

        // Check if script is complete
        if (isScriptComplete(script)) {
            script.setActive(false);
            log.info("Script {} completed", script.getName());
        }

        scriptRepository.save(script);
        notifyScriptUpdate(script);
    }

    /**
     * Determine if an action should be executed based on its trigger
     */
    private boolean shouldExecuteAction(Script script, ScriptAction action) {
        switch (action.getTriggerType()) {
            case IMMEDIATE:
                return true;

            case TIME_BASED:
                return checkTimeBasedTrigger(script, action);

            case CONDITION_BASED:
                return checkConditionBasedTrigger(action);

            case MANUAL:
                return false; // Manual actions are triggered via API

            default:
                return false;
        }
    }

    /**
     * Check if time-based trigger condition is met
     */
    private boolean checkTimeBasedTrigger(Script script, ScriptAction action) {
        if (action.getDelaySeconds() == null) {
            return true;
        }

        // Check if enough time has passed since script started
        int elapsedSeconds = script.getElapsedSeconds();

        // Also consider previous action completion
        if (action.getExecutionOrder() > 1) {
            // Find previous action
            List<ScriptAction> allActions = scriptActionRepository.findByScriptIdOrderByExecutionOrderAsc(script.getId());
            Optional<ScriptAction> previousAction = allActions.stream()
                    .filter(a -> a.getExecutionOrder() == action.getExecutionOrder() - 1)
                    .findFirst();

            if (previousAction.isPresent()) {
                ScriptAction prev = previousAction.get();
                if (prev.getStatus() != ActionStatus.COMPLETED) {
                    return false; // Previous action not complete
                }

                // Calculate delay from previous action completion
                if (prev.getCompletedAt() != null) {
                    long secondsSincePrevious = ChronoUnit.SECONDS.between(prev.getCompletedAt(), LocalDateTime.now());
                    return secondsSincePrevious >= action.getDelaySeconds();
                }
            }
        }

        return elapsedSeconds >= action.getDelaySeconds();
    }

    /**
     * Check if condition-based trigger is met
     */
    private boolean checkConditionBasedTrigger(ScriptAction action) {
        if (action.getCondition() == null || action.getCondition() == TriggerCondition.NONE) {
            return true;
        }

        Optional<GeneralUnit> unitOpt = unitRepository.findById(action.getUnitId());
        if (unitOpt.isEmpty()) {
            return false;
        }
        GeneralUnit unit = unitOpt.get();

        switch (action.getCondition()) {
            case SUPPLY_LOW:
                double supplyThreshold = action.getConditionValue() != null ? action.getConditionValue() : 30.0;
                return unit.getSupplyLevel() < supplyThreshold;

            case MORALE_LOW:
                double moraleThreshold = action.getConditionValue() != null ? action.getConditionValue() : 40.0;
                return unit.getMorale() < moraleThreshold;

            case UNIT_IN_RANGE:
                return checkEnemyInRange(unit, action.getConditionValue());

            case ALLIED_UNIT_IN_RANGE:
                return checkAllyInRange(unit, action.getConditionValue());

            case UNIT_DESTROYED:
                if (action.getConditionUnitId() != null) {
                    return !unitRepository.existsById(action.getConditionUnitId());
                }
                return false;

            case PREVIOUS_ACTION_COMPLETE:
                return checkPreviousActionComplete(action);

            default:
                return false;
        }
    }

    /**
     * Check if enemy unit is within range
     */
    private boolean checkEnemyInRange(GeneralUnit unit, Double rangeKm) {
        if (rangeKm == null) rangeKm = 5.0;

        Faction enemyFaction = unit.getFaction() == Faction.BLUE_FORCE ? Faction.RED_FORCE : Faction.BLUE_FORCE;
        List<GeneralUnit> enemyUnits = unitRepository.findByFaction(enemyFaction);

        for (GeneralUnit enemy : enemyUnits) {
            double distance = communicationService.calculateDistance(unit.getPosition(), enemy.getPosition());
            if (distance <= rangeKm) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if allied unit is within range
     */
    private boolean checkAllyInRange(GeneralUnit unit, Double rangeKm) {
        if (rangeKm == null) rangeKm = 5.0;

        List<GeneralUnit> allyUnits = unitRepository.findByFaction(unit.getFaction());

        for (GeneralUnit ally : allyUnits) {
            if (!ally.getId().equals(unit.getId())) {
                double distance = communicationService.calculateDistance(unit.getPosition(), ally.getPosition());
                if (distance <= rangeKm) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if previous action in sequence is complete
     */
    private boolean checkPreviousActionComplete(ScriptAction action) {
        if (action.getExecutionOrder() <= 1) {
            return true;
        }

        List<ScriptAction> allActions = scriptActionRepository.findByScriptIdOrderByExecutionOrderAsc(action.getScriptId());
        Optional<ScriptAction> previousAction = allActions.stream()
                .filter(a -> a.getExecutionOrder() == action.getExecutionOrder() - 1)
                .findFirst();

        return previousAction.map(a -> a.getStatus() == ActionStatus.COMPLETED).orElse(true);
    }

    /**
     * Execute a script action - apply changes to the unit
     */
    private void executeAction(Script script, ScriptAction action) {
        log.info("Executing action {} for script {}", action.getActionType(), script.getName());

        Optional<GeneralUnit> unitOpt = unitRepository.findById(action.getUnitId());
        if (unitOpt.isEmpty()) {
            action.setStatus(ActionStatus.FAILED);
            action.setFailureReason("Unit not found");
            scriptActionRepository.save(action);
            script.setFailedActions(script.getFailedActions() + 1);
            return;
        }

        GeneralUnit unit = unitOpt.get();
        action.setStatus(ActionStatus.EXECUTING);
        action.setStartedAt(LocalDateTime.now());

        try {
            switch (action.getActionType()) {
                case MOVE:
                    executeMove(unit, action);
                    break;

                case ATTACK:
                    executeAttack(unit, action);
                    break;

                case DEFEND:
                    executeDefend(unit, action);
                    break;

                case RETREAT:
                    executeRetreat(unit, action);
                    break;

                case RECON:
                    executeRecon(unit, action);
                    break;

                case AMBUSH:
                    executeAmbush(unit, action);
                    break;

                case FLANK:
                    executeFlank(unit, action);
                    break;

                case SUPPORT_FIRE:
                    executeSupportFire(unit, action);
                    break;

                case HOLD_FIRE:
                    executeHoldFire(unit, action);
                    break;

                case REGROUP:
                    executeRegroup(unit, action);
                    break;

                default:
                    log.warn("Unknown action type: {}", action.getActionType());
            }

            // Mark action as completed
            action.setStatus(ActionStatus.COMPLETED);
            action.setCompletedAt(LocalDateTime.now());
            script.setCompletedActions(script.getCompletedActions() + 1);

        } catch (Exception e) {
            log.error("Error executing action: {}", e.getMessage());
            action.setStatus(ActionStatus.FAILED);
            action.setFailureReason(e.getMessage());
            script.setFailedActions(script.getFailedActions() + 1);
        }

        scriptActionRepository.save(action);
        unitRepository.save(unit);
        notifyActionExecution(action, unit);
    }

    // Action execution implementations
    private void executeMove(GeneralUnit unit, ScriptAction action) {
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
            unit.setStatus(Status.ATTACKING); // Moving = aggressive posture
            log.info("Unit {} moved to [{}, {}]", unit.getId(),
                    action.getTargetPosition().getLatitude(),
                    action.getTargetPosition().getLongitude());
        }
    }

    private void executeAttack(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.ATTACKING);
        // If target position specified, move towards it
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
        }
        log.info("Unit {} attacking", unit.getId());
    }

    private void executeDefend(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.DEFENDING);
        log.info("Unit {} defending position", unit.getId());
    }

    private void executeRetreat(GeneralUnit unit, ScriptAction action) {
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
        }
        unit.setStatus(Status.DEFENDING);
        // Reduce morale slightly for retreat
        unit.setMorale(Math.max(0, unit.getMorale() - 5));
        log.info("Unit {} retreating", unit.getId());
    }

    private void executeRecon(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.ATTACKING);
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
        }
        log.info("Unit {} performing reconnaissance", unit.getId());
    }

    private void executeAmbush(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.DEFENDING);
        log.info("Unit {} setting up ambush", unit.getId());
    }

    private void executeFlank(GeneralUnit unit, ScriptAction action) {
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
        }
        unit.setStatus(Status.ATTACKING);
        log.info("Unit {} flanking", unit.getId());
    }

    private void executeSupportFire(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.ATTACKING);
        log.info("Unit {} providing support fire", unit.getId());
    }

    private void executeHoldFire(GeneralUnit unit, ScriptAction action) {
        unit.setStatus(Status.DEFENDING);
        log.info("Unit {} holding fire", unit.getId());
    }

    private void executeRegroup(GeneralUnit unit, ScriptAction action) {
        if (action.getTargetPosition() != null) {
            unit.setPosition(action.getTargetPosition());
        }
        // Boost morale for regrouping
        unit.setMorale(Math.min(100, unit.getMorale() + 10));
        unit.setStatus(Status.DEFENDING);
        log.info("Unit {} regrouping", unit.getId());
    }

    /**
     * Check if script has completed all actions
     */
    private boolean isScriptComplete(Script script) {
        List<ScriptAction> allActions = scriptActionRepository.findByScriptId(script.getId());
        return allActions.stream().allMatch(a ->
                a.getStatus() == ActionStatus.COMPLETED || a.getStatus() == ActionStatus.FAILED
        );
    }

    /**
     * Activate a script
     */
    public Script activateScript(String scriptId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        script.setActive(true);
        script.setPaused(false);
        script.setStartedAt(LocalDateTime.now());
        script.setElapsedSeconds(0);
        script.setCompletedActions(0);
        script.setFailedActions(0);

        // Count total actions
        List<ScriptAction> actions = scriptActionRepository.findByScriptId(scriptId);
        script.setTotalActions(actions.size());

        // Reset all actions to PENDING
        for (ScriptAction action : actions) {
            action.setStatus(ActionStatus.PENDING);
            action.setStartedAt(null);
            action.setCompletedAt(null);
            action.setFailureReason(null);
            scriptActionRepository.save(action);
        }

        return scriptRepository.save(script);
    }

    /**
     * Deactivate a script
     */
    public Script deactivateScript(String scriptId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        script.setActive(false);
        script.setPaused(false);

        return scriptRepository.save(script);
    }

    /**
     * Pause a script
     */
    public Script pauseScript(String scriptId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        script.setPaused(true);
        script.setPausedAt(LocalDateTime.now());

        return scriptRepository.save(script);
    }

    /**
     * Resume a paused script
     */
    public Script resumeScript(String scriptId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new RuntimeException("Script not found"));

        script.setPaused(false);

        return scriptRepository.save(script);
    }

    /**
     * Manually trigger a specific action
     */
    public ScriptAction triggerActionManually(String actionId) {
        ScriptAction action = scriptActionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Action not found"));

        Script script = scriptRepository.findById(action.getScriptId())
                .orElseThrow(() -> new RuntimeException("Script not found"));

        if (action.getStatus() == ActionStatus.PENDING) {
            executeAction(script, action);
            scriptRepository.save(script);
        }

        return action;
    }

    // WebSocket notifications
    private void notifyScriptUpdate(Script script) {
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/scripts", script);
        }
    }

    private void notifyActionExecution(ScriptAction action, GeneralUnit unit) {
        if (messagingTemplate != null) {
            messagingTemplate.convertAndSend("/topic/script-actions",
                    Map.of("action", action, "unit", unit));
        }
    }
}
