package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.Formation;

import java.util.List;
import java.util.Optional;

public interface FormationRepository extends MongoRepository<Formation, String> {
    List<Formation> findByUserId(String userId);
    Optional<Formation> findByHeadquartersUnitId(String headquartersUnitId);
    List<Formation> findByParentFormationId(String parentFormationId);
}
