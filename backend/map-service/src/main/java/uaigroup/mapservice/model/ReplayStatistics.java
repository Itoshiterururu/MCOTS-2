package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReplayStatistics {
    private int totalUnits;
    private int blueForceUnits;
    private int redForceUnits;

    private int unitsDestroyed;
    private int blueForceDestroyed;
    private int redForceDestroyed;

    private int totalActions;
    private int completedActions;
    private int failedActions;

    private int totalEvents;
    private Map<EventType, Integer> eventsByType;

    private double averageUnitHealth;
    private double blueForceAverageHealth;
    private double redForceAverageHealth;

    private int communicationEvents;
    private int attackEvents;
    private int movementEvents;

    private long durationSeconds;
    private int snapshotCount;
}
