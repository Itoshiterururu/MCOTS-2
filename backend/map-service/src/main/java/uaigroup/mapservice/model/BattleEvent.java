package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleEvent {
    private LocalDateTime timestamp;
    private EventType eventType;
    private String unitId;
    private String targetUnitId;
    private Position location;
    private String description;
    private Map<String, Object> metadata;
    private Faction faction;
}
