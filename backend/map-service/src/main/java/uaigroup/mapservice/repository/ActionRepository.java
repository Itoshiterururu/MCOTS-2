package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.Action;
import uaigroup.mapservice.model.ActionStatus;

import java.util.List;

public interface ActionRepository extends MongoRepository<Action, String> {
    List<Action> findByUnitId(String unitId);
    List<Action> findByStatus(ActionStatus status);
}
