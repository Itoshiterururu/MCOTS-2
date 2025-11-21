package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.ActionStatus;
import uaigroup.mapservice.model.ScriptAction;

import java.util.List;

public interface ScriptActionRepository extends MongoRepository<ScriptAction, String> {
    List<ScriptAction> findByScriptId(String scriptId);

    List<ScriptAction> findByScriptIdOrderByExecutionOrderAsc(String scriptId);

    List<ScriptAction> findByScriptIdAndStatus(String scriptId, ActionStatus status);

    List<ScriptAction> findByUnitId(String unitId);

    void deleteByScriptId(String scriptId);
}
