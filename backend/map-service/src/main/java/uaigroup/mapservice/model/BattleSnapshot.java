package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BattleSnapshot {
    private LocalDateTime timestamp;
    private List<GeneralUnit> units;
    private List<Obstacle> obstacles;
    private List<Action> activeActions;
    private int snapshotNumber;
}
