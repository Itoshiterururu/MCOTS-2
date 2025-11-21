package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.Script;

import java.util.List;

public interface ScriptRepository extends MongoRepository<Script, String> {
    List<Script> findByUserId(String userId);

    List<Script> findByIsActiveTrue();

    List<Script> findByUserIdAndIsActiveTrue(String userId);
}
