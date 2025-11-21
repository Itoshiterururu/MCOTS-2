package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "scripts")
public class Script {
    @Id
    private String id;

    private String userId;                  // Script creator
    private String name;                    // Script name (e.g., "Counter-attack at dawn")
    private String description;             // Detailed description
    private Faction targetFaction;          // Which faction executes this script (usually RED_FORCE)
    private boolean isActive;               // Is the script currently running?
    private boolean isPaused;               // Is the script paused?

    // Timing
    private LocalDateTime startedAt;        // When the script was activated
    private LocalDateTime pausedAt;         // When the script was paused
    private int totalDurationSeconds;       // Expected total duration
    private int elapsedSeconds;             // Time elapsed since start

    // Statistics
    private int totalActions;               // Total number of actions in script
    private int completedActions;           // Number of completed actions
    private int failedActions;              // Number of failed actions

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
