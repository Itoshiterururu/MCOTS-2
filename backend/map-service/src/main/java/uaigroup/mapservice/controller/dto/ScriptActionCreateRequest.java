package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.*;

public record ScriptActionCreateRequest(
    String scriptId,
    String unitId,
    int executionOrder,
    ActionType actionType,
    String description,
    ActionPriority priority,
    TriggerType triggerType,
    Integer delaySeconds,
    TriggerCondition condition,
    Double conditionValue,
    String conditionUnitId,
    Position targetPosition,
    String targetUnitId,
    Integer durationSeconds
) {}
