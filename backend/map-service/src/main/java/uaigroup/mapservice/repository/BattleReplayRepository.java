package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.BattleReplay;
import java.util.List;
import java.util.Optional;

public interface BattleReplayRepository extends MongoRepository<BattleReplay, String> {
    List<BattleReplay> findByUserId(String userId);
    List<BattleReplay> findByUserIdAndIsCompleted(String userId, boolean isCompleted);
    Optional<BattleReplay> findByUserIdAndIsRecording(String userId, boolean isRecording);
}
