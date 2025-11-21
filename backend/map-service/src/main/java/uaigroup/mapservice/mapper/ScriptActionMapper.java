package uaigroup.mapservice.mapper;

import org.springframework.stereotype.Component;
import uaigroup.mapservice.controller.dto.ScriptActionCreateRequest;
import uaigroup.mapservice.model.ActionStatus;
import uaigroup.mapservice.model.ScriptAction;

import java.util.UUID;

@Component
public class ScriptActionMapper {

    public ScriptAction toEntity(ScriptActionCreateRequest request) {
        ScriptAction action = new ScriptAction();

        action.setId(UUID.randomUUID().toString());
        action.setScriptId(request.scriptId());
        action.setUnitId(request.unitId());
        action.setExecutionOrder(request.executionOrder());

        action.setActionType(request.actionType());
        action.setDescription(request.description());
        action.setPriority(request.priority() != null ? request.priority() : uaigroup.mapservice.model.ActionPriority.MEDIUM);

        action.setTriggerType(request.triggerType());
        action.setDelaySeconds(request.delaySeconds());
        action.setCondition(request.condition());
        action.setConditionValue(request.conditionValue());
        action.setConditionUnitId(request.conditionUnitId());

        action.setTargetPosition(request.targetPosition());
        action.setTargetUnitId(request.targetUnitId());
        action.setDurationSeconds(request.durationSeconds());

        action.setStatus(ActionStatus.PENDING);

        return action;
    }
}
