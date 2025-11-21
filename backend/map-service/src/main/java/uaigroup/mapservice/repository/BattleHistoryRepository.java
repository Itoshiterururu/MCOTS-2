package uaigroup.mapservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.BattleHistory;
import java.util.List;

public interface BattleHistoryRepository extends MongoRepository<BattleHistory, String> {
    List<BattleHistory> findByUserId(String userId);
}