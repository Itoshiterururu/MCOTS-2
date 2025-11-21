package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.Obstacle;

import java.util.List;

public interface ObstacleRepository extends MongoRepository<Obstacle, String> {
    List<Obstacle> findByCreatedBy(String createdBy);
}