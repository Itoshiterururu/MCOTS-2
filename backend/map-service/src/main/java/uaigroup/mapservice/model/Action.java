package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "unit_actions")
public class Action {
    @Id
    private String id;

    private String unitId;
    private String description;

    // Enhanced action fields
    private ActionType actionType;
    private ActionStatus status;
    private ActionPriority priority;

    // Target information
    private Position targetPosition;       // For MOVE, ATTACK on location
    private String targetUnitId;            // For ATTACK on specific unit

    // Timing
    private Integer durationSeconds;        // How long the action takes
    private LocalDateTime scheduledAt;      // When to start execution
    private LocalDateTime startedAt;        // When execution actually started
    private LocalDateTime completedAt;      // When execution finished

    // Execution details
    private Integer executionOrder;         // Order in sequence (for scripts)
    private String scriptId;                // If part of a script
    private String failureReason;           // Why it failed (if applicable)

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
