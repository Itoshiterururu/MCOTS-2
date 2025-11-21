package uaigroup.mapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uaigroup.mapservice.model.*;
import uaigroup.mapservice.repository.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BattleReplayService {

    private final BattleReplayRepository replayRepository;
    private final UnitRepository unitRepository;
    private final ObstacleRepository obstacleRepository;
    private final ActionRepository actionRepository;

    /**
     * Start recording a new battle replay
     */
    public BattleReplay startRecording(String userId, String battleName, String description) {
        // Check if there's already an active recording
        Optional<BattleReplay> activeRecording = replayRepository.findByUserIdAndIsRecording(userId, true);
        if (activeRecording.isPresent()) {
            throw new IllegalStateException("A battle recording is already in progress");
        }

        BattleReplay replay = new BattleReplay();
        replay.setUserId(userId);
        replay.setBattleName(battleName);
        replay.setDescription(description);
        replay.setStartTime(LocalDateTime.now());
        replay.setRecording(true);
        replay.setCompleted(false);
        replay.setCreatedAt(LocalDateTime.now());
        replay.setUpdatedAt(LocalDateTime.now());

        // Capture initial snapshot
        captureSnapshot(replay);

        // Record battle started event
        recordEvent(replay, BattleEvent.builder()
                .timestamp(LocalDateTime.now())
                .eventType(EventType.BATTLE_STARTED)
                .description("Battle recording started: " + battleName)
                .build());

        return replayRepository.save(replay);
    }

    /**
     * Stop recording and finalize the replay with statistics
     */
    public BattleReplay stopRecording(String userId) {
        BattleReplay replay = replayRepository.findByUserIdAndIsRecording(userId, true)
                .orElseThrow(() -> new IllegalStateException("No active recording found"));

        // Capture final snapshot
        captureSnapshot(replay);

        // Record battle ended event
        recordEvent(replay, BattleEvent.builder()
                .timestamp(LocalDateTime.now())
                .eventType(EventType.BATTLE_ENDED)
                .description("Battle recording ended")
                .build());

        replay.setEndTime(LocalDateTime.now());
        replay.setRecording(false);
        replay.setCompleted(true);
        replay.setUpdatedAt(LocalDateTime.now());

        // Calculate statistics
        replay.setStatistics(calculateStatistics(replay));

        return replayRepository.save(replay);
    }

    /**
     * Record an event during the battle
     */
    public void recordEvent(String userId, BattleEvent event) {
        Optional<BattleReplay> activeRecording = replayRepository.findByUserIdAndIsRecording(userId, true);
        if (activeRecording.isPresent()) {
            recordEvent(activeRecording.get(), event);
            replayRepository.save(activeRecording.get());
        }
    }

    private void recordEvent(BattleReplay replay, BattleEvent event) {
        if (event.getTimestamp() == null) {
            event.setTimestamp(LocalDateTime.now());
        }
        replay.getEvents().add(event);
        log.debug("Recorded event: {} for replay {}", event.getEventType(), replay.getId());
    }

    /**
     * Capture current battle state as a snapshot
     */
    public void captureSnapshot(String userId) {
        Optional<BattleReplay> activeRecording = replayRepository.findByUserIdAndIsRecording(userId, true);
        if (activeRecording.isPresent()) {
            BattleReplay replay = activeRecording.get();
            captureSnapshot(replay);
            replayRepository.save(replay);
        }
    }

    private void captureSnapshot(BattleReplay replay) {
        List<GeneralUnit> units = unitRepository.findAll();
        List<Obstacle> obstacles = obstacleRepository.findAll();
        List<Action> activeActions = actionRepository.findByStatus(ActionStatus.EXECUTING);

        BattleSnapshot snapshot = BattleSnapshot.builder()
                .timestamp(LocalDateTime.now())
                .units(deepCopyUnits(units))
                .obstacles(deepCopyObstacles(obstacles))
                .activeActions(deepCopyActions(activeActions))
                .snapshotNumber(replay.getSnapshots().size() + 1)
                .build();

        replay.getSnapshots().add(snapshot);
        replay.setUpdatedAt(LocalDateTime.now());
        log.debug("Captured snapshot #{} for replay {}", snapshot.getSnapshotNumber(), replay.getId());
    }

    /**
     * Scheduled task to capture snapshots every 10 seconds for active recordings
     */
    @Scheduled(fixedRate = 10000)
    public void captureScheduledSnapshots() {
        List<BattleReplay> activeRecordings = replayRepository.findAll()
                .stream()
                .filter(r -> r.isRecording() && !r.isCompleted())
                .toList();

        for (BattleReplay replay : activeRecordings) {
            try {
                captureSnapshot(replay);
                replayRepository.save(replay);
            } catch (Exception e) {
                log.error("Failed to capture scheduled snapshot for replay {}: {}", replay.getId(), e.getMessage());
            }
        }
    }

    /**
     * Get all replays for a user
     */
    public List<BattleReplay> getUserReplays(String userId) {
        return replayRepository.findByUserId(userId);
    }

    /**
     * Get a specific replay by ID
     */
    public BattleReplay getReplay(String replayId) {
        return replayRepository.findById(replayId)
                .orElseThrow(() -> new IllegalArgumentException("Replay not found: " + replayId));
    }

    /**
     * Delete a replay
     */
    public void deleteReplay(String replayId) {
        replayRepository.deleteById(replayId);
    }

    /**
     * Calculate statistics for the replay
     */
    private ReplayStatistics calculateStatistics(BattleReplay replay) {
        if (replay.getSnapshots().isEmpty()) {
            return new ReplayStatistics();
        }

        BattleSnapshot firstSnapshot = replay.getSnapshots().get(0);
        BattleSnapshot lastSnapshot = replay.getSnapshots().get(replay.getSnapshots().size() - 1);

        // Count units by faction
        int totalUnits = firstSnapshot.getUnits().size();
        long blueForceUnits = firstSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.BLUE_FORCE)
                .count();
        long redForceUnits = firstSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.RED_FORCE)
                .count();

        // Count destroyed units
        Set<String> initialUnitIds = firstSnapshot.getUnits().stream()
                .map(GeneralUnit::getId)
                .collect(Collectors.toSet());
        Set<String> finalUnitIds = lastSnapshot.getUnits().stream()
                .map(GeneralUnit::getId)
                .collect(Collectors.toSet());
        initialUnitIds.removeAll(finalUnitIds);
        int unitsDestroyed = initialUnitIds.size();

        // Calculate destroyed by faction
        int blueDestroyed = (int) firstSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.BLUE_FORCE && initialUnitIds.contains(u.getId()))
                .count();
        int redDestroyed = (int) firstSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.RED_FORCE && initialUnitIds.contains(u.getId()))
                .count();

        // Calculate average supply level
        double avgHealth = lastSnapshot.getUnits().stream()
                .mapToInt(GeneralUnit::getSupplyLevel)
                .average()
                .orElse(0.0);
        double blueAvgHealth = lastSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.BLUE_FORCE)
                .mapToInt(GeneralUnit::getSupplyLevel)
                .average()
                .orElse(0.0);
        double redAvgHealth = lastSnapshot.getUnits().stream()
                .filter(u -> u.getFaction() == Faction.RED_FORCE)
                .mapToInt(GeneralUnit::getSupplyLevel)
                .average()
                .orElse(0.0);

        // Count events by type
        Map<EventType, Integer> eventsByType = new HashMap<>();
        for (BattleEvent event : replay.getEvents()) {
            eventsByType.merge(event.getEventType(), 1, Integer::sum);
        }

        // Calculate duration
        long durationSeconds = Duration.between(replay.getStartTime(), replay.getEndTime()).getSeconds();

        return ReplayStatistics.builder()
                .totalUnits(totalUnits)
                .blueForceUnits((int) blueForceUnits)
                .redForceUnits((int) redForceUnits)
                .unitsDestroyed(unitsDestroyed)
                .blueForceDestroyed(blueDestroyed)
                .redForceDestroyed(redDestroyed)
                .totalActions(lastSnapshot.getActiveActions().size())
                .completedActions(eventsByType.getOrDefault(EventType.ACTION_COMPLETED, 0))
                .failedActions(eventsByType.getOrDefault(EventType.ACTION_FAILED, 0))
                .totalEvents(replay.getEvents().size())
                .eventsByType(eventsByType)
                .averageUnitHealth(avgHealth)
                .blueForceAverageHealth(blueAvgHealth)
                .redForceAverageHealth(redAvgHealth)
                .communicationEvents(
                        eventsByType.getOrDefault(EventType.COMMS_ESTABLISHED, 0) +
                        eventsByType.getOrDefault(EventType.COMMS_LOST, 0)
                )
                .attackEvents(eventsByType.getOrDefault(EventType.UNIT_ATTACKED, 0))
                .movementEvents(eventsByType.getOrDefault(EventType.UNIT_MOVED, 0))
                .durationSeconds(durationSeconds)
                .snapshotCount(replay.getSnapshots().size())
                .build();
    }

    // Deep copy methods to avoid references
    private List<GeneralUnit> deepCopyUnits(List<GeneralUnit> units) {
        return units.stream()
                .map(this::copyUnit)
                .collect(Collectors.toList());
    }

    private GeneralUnit copyUnit(GeneralUnit unit) {
        GeneralUnit copy = new GeneralUnit();
        copy.setId(unit.getId());
        copy.setUserId(unit.getUserId());
        copy.setUnitType(unit.getUnitType());
        copy.setFaction(unit.getFaction());
        copy.setUnitRank(unit.getUnitRank());
        copy.setPosition(copyPosition(unit.getPosition()));
        copy.setPersonnel(unit.getPersonnel());
        copy.setVehicles(unit.getVehicles());
        copy.setFirepower(unit.getFirepower());
        copy.setSupplyLevel(unit.getSupplyLevel());
        copy.setMorale(unit.getMorale());
        copy.setDirection(unit.getDirection());
        copy.setMobility(unit.getMobility());
        copy.setFirepowerBase(unit.getFirepowerBase());
        copy.setDefense(unit.getDefense());
        copy.setRange(unit.getRange());
        copy.setStatus(unit.getStatus());
        copy.setHasCommsLink(unit.isHasCommsLink());
        copy.setLinkedCommsUnitId(unit.getLinkedCommsUnitId());
        copy.setCommsStrength(unit.getCommsStrength());
        copy.setFieldOfFire(unit.getFieldOfFire()); // Copy field of fire
        copy.setActiveFireMissionId(unit.getActiveFireMissionId());
        return copy;
    }

    private Position copyPosition(Position position) {
        if (position == null) return null;
        Position copy = new Position();
        copy.setLatitude(position.getLatitude());
        copy.setLongitude(position.getLongitude());
        return copy;
    }

    private List<Obstacle> deepCopyObstacles(List<Obstacle> obstacles) {
        return obstacles.stream()
                .map(this::copyObstacle)
                .collect(Collectors.toList());
    }

    private Obstacle copyObstacle(Obstacle obstacle) {
        Obstacle copy = new Obstacle();
        copy.setId(obstacle.getId());
        copy.setCreatedBy(obstacle.getCreatedBy());
        copy.setType(obstacle.getType());
        copy.setStartPosition(copyPosition(obstacle.getStartPosition()));
        copy.setEndPosition(copyPosition(obstacle.getEndPosition()));
        return copy;
    }

    private List<Action> deepCopyActions(List<Action> actions) {
        return actions.stream()
                .map(this::copyAction)
                .collect(Collectors.toList());
    }

    private Action copyAction(Action action) {
        Action copy = new Action();
        copy.setId(action.getId());
        copy.setUnitId(action.getUnitId());
        copy.setActionType(action.getActionType());
        copy.setStatus(action.getStatus());
        copy.setPriority(action.getPriority());
        copy.setTargetPosition(copyPosition(action.getTargetPosition()));
        copy.setTargetUnitId(action.getTargetUnitId());
        copy.setDurationSeconds(action.getDurationSeconds());
        return copy;
    }
}
