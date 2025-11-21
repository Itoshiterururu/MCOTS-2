package uaigroup.mapservice.mapper;

import org.springframework.stereotype.Component;
import uaigroup.mapservice.controller.dto.ActionCreateRequest;
import uaigroup.mapservice.controller.dto.ActionUpdateRequest;
import uaigroup.mapservice.model.Action;
import uaigroup.mapservice.model.ActionStatus;

import java.util.UUID;

@Component
public class ActionMapper {

    public Action toEntity(ActionCreateRequest request) {
        Action action = new Action();

        action.setId(UUID.randomUUID().toString());
        action.setUnitId(request.unitId());
        action.setDescription(request.description());

        // Set action type and initial status
        action.setActionType(request.actionType());
        action.setStatus(ActionStatus.PENDING);  // New actions start as PENDING
        action.setPriority(request.priority());

        // Set target information
        action.setTargetPosition(request.targetPosition());
        action.setTargetUnitId(request.targetUnitId());

        // Set timing
        action.setDurationSeconds(request.durationSeconds());
        action.setScheduledAt(request.scheduledAt());

        // Set execution details
        action.setExecutionOrder(request.executionOrder());
        action.setScriptId(request.scriptId());

        return action;
    }

    public Action updateFromRequest(Action existingAction, ActionUpdateRequest request) {
        existingAction.setUnitId(request.unitId());
        existingAction.setDescription(request.description());

        // Update action type and status
        if (request.actionType() != null) {
            existingAction.setActionType(request.actionType());
        }
        if (request.status() != null) {
            existingAction.setStatus(request.status());
        }
        if (request.priority() != null) {
            existingAction.setPriority(request.priority());
        }

        // Update target information
        existingAction.setTargetPosition(request.targetPosition());
        existingAction.setTargetUnitId(request.targetUnitId());

        // Update timing
        if (request.durationSeconds() != null) {
            existingAction.setDurationSeconds(request.durationSeconds());
        }
        if (request.scheduledAt() != null) {
            existingAction.setScheduledAt(request.scheduledAt());
        }

        // Update execution details
        if (request.executionOrder() != null) {
            existingAction.setExecutionOrder(request.executionOrder());
        }
        if (request.scriptId() != null) {
            existingAction.setScriptId(request.scriptId());
        }
        if (request.failureReason() != null) {
            existingAction.setFailureReason(request.failureReason());
        }

        return existingAction;
    }
}
