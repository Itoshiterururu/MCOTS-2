package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.FireMission;

import java.util.List;

public interface FireMissionRepository extends MongoRepository<FireMission, String> {
    List<FireMission> findByUserId(String userId);
    List<FireMission> findByArtilleryUnitId(String artilleryUnitId);
    List<FireMission> findByStatus(String status);
    List<FireMission> findByUserIdAndStatus(String userId, String status);
}
