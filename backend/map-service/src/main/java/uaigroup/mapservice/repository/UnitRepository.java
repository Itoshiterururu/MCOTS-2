package uaigroup.mapservice.repository;
import org.springframework.data.mongodb.repository.MongoRepository;
import uaigroup.mapservice.model.Faction;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.UnitType;

import java.util.List;

public interface UnitRepository extends MongoRepository<GeneralUnit, String> {
    List<GeneralUnit> findByUserId(String userId);

    List<GeneralUnit> findByUnitType(UnitType unitType);

    List<GeneralUnit> findByFactionAndUnitType(Faction faction, UnitType unitType);

    List<GeneralUnit> findByFaction(Faction faction);

    List<GeneralUnit> findByParentUnitId(String parentUnitId);

    List<GeneralUnit> findByIsFormationHQ(boolean isFormationHQ);
}