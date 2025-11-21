package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.ActionPriority;
import uaigroup.mapservice.model.ActionStatus;
import uaigroup.mapservice.model.ActionType;
import uaigroup.mapservice.model.Position;

import java.time.LocalDateTime;

public record ActionUpdateRequest(
    String id,
    String unitId,
    String description,
    ActionType actionType,
    ActionStatus status,
    ActionPriority priority,
    Position targetPosition,
    String targetUnitId,
    Integer durationSeconds,
    LocalDateTime scheduledAt,
    Integer executionOrder,
    String scriptId,
    String failureReason,
    LocalDateTime updatedAt
) {}
