package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "script_actions")
public class ScriptAction {
    @Id
    private String id;

    private String scriptId;                // Parent script
    private String unitId;                  // Which unit executes this action
    private int executionOrder;             // Order in the sequence (1, 2, 3...)

    // Action details
    private ActionType actionType;          // MOVE, ATTACK, DEFEND, etc.
    private String description;             // Human-readable description
    private ActionPriority priority;        // Priority level

    // Trigger configuration
    private TriggerType triggerType;        // TIME_BASED, CONDITION_BASED, etc.
    private Integer delaySeconds;           // For TIME_BASED: delay after script start or previous action
    private TriggerCondition condition;     // For CONDITION_BASED
    private Double conditionValue;          // Threshold value for condition (e.g., range in km, supply %)
    private String conditionUnitId;         // For conditions involving another unit

    // Target information
    private Position targetPosition;        // For MOVE actions
    private String targetUnitId;            // For ATTACK actions
    private Integer durationSeconds;        // How long the action takes

    // Execution status
    private ActionStatus status;            // PENDING, EXECUTING, COMPLETED, etc.
    private LocalDateTime scheduledAt;      // When it should execute
    private LocalDateTime startedAt;        // When execution started
    private LocalDateTime completedAt;      // When execution finished
    private String failureReason;           // If failed, why

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
