package uaigroup.mapservice.mapper;

import org.springframework.stereotype.Component;
import uaigroup.mapservice.controller.dto.ObstacleCreateRequest;
import uaigroup.mapservice.controller.dto.ObstacleUpdateRequest;
import uaigroup.mapservice.model.Obstacle;
import uaigroup.mapservice.model.Position;

import java.util.UUID;

@Component
public class ObstacleMapper {
    
    public Obstacle toEntity(ObstacleCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("ObstacleCreateRequest cannot be null");
        }
        
        Obstacle obstacle = new Obstacle();
        
        obstacle.setId(UUID.randomUUID().toString());
        obstacle.setStartPosition(new Position(
            request.startPosition().getLatitude(),
            request.startPosition().getLongitude()
        ));
        obstacle.setEndPosition(new Position(
            request.endPosition().getLatitude(),
            request.endPosition().getLongitude()
        ));
        obstacle.setType(request.type());
        
        return obstacle;
    }
    
    public Obstacle updateFromRequest(Obstacle existingObstacle, ObstacleUpdateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("ObstacleUpdateRequest cannot be null");
        }
        if (existingObstacle == null) {
            throw new IllegalArgumentException("Existing obstacle cannot be null");
        }
        
        existingObstacle.setStartPosition(request.startPosition());
        existingObstacle.setEndPosition(request.endPosition());
        existingObstacle.setType(request.type());
        
        return existingObstacle;
    }
}