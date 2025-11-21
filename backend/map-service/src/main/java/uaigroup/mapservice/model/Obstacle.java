package uaigroup.mapservice.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "obstacles")
public class Obstacle {
    @Id
    private String id;
    private Position startPosition;
    private Position endPosition;
    private ObstacleType type;
    private String createdBy;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}