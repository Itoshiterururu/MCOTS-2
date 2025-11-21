package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "battle_history")
public class BattleHistory {
    @Id
    private String id;
    private String userId;
    private String battleName;
    private List<GeneralUnit> units;
    private List<Obstacle> obstacles;
    
    @CreatedDate
    private LocalDateTime createdAt;
}