package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "battle_replays")
public class BattleReplay {
    @Id
    private String id;
    private String userId;
    private String battleName;
    private String description;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean isRecording;
    private boolean isCompleted;

    private List<BattleSnapshot> snapshots = new ArrayList<>();
    private List<BattleEvent> events = new ArrayList<>();

    private ReplayStatistics statistics;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
