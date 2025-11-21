package uaigroup.mapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import uaigroup.mapservice.controller.dto.ActionCreateRequest;
import uaigroup.mapservice.controller.dto.ActionUpdateRequest;
import uaigroup.mapservice.controller.dto.ObstacleCreateRequest;
import uaigroup.mapservice.controller.dto.ObstacleUpdateRequest;
import uaigroup.mapservice.controller.dto.UnitCreateRequest;
import uaigroup.mapservice.controller.dto.UnitUpdateRequest;
import uaigroup.mapservice.mapper.ActionMapper;
import uaigroup.mapservice.mapper.ObstacleMapper;
import uaigroup.mapservice.mapper.UnitMapper;
import uaigroup.mapservice.model.Action;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.Obstacle;
import uaigroup.mapservice.repository.ActionRepository;
import uaigroup.mapservice.repository.ObstacleRepository;
import uaigroup.mapservice.repository.UnitRepository;
import uaigroup.mapservice.repository.BattleHistoryRepository;
import uaigroup.mapservice.controller.dto.BattleSaveRequest;
import uaigroup.mapservice.model.BattleHistory;
import java.util.Map;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MapService {

    private final UnitRepository unitRepository;
    private final ObstacleRepository obstacleRepository;
    private final ActionRepository actionRepository;
    private final BattleHistoryRepository battleHistoryRepository;
    private final UnitMapper unitMapper;
    private final ObstacleMapper obstacleMapper;
    private final ActionMapper actionMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final UnitCharacteristicsService unitCharacteristicsService;

    // Removed - now using UnitCharacteristicsService

    public GeneralUnit createUnit(UnitCreateRequest request, String userId) {
        GeneralUnit unit = unitMapper.toEntity(request);
        unit.setUserId(userId);
        
        // Set unit characteristics based on type and faction
        var characteristics = unitCharacteristicsService.getCharacteristics(unit.getUnitType(), unit.getFaction());
        unit.setMobility(characteristics.getMobility());
        unit.setFirepowerBase(characteristics.getFirepowerBase());
        unit.setDefense(characteristics.getDefense());
        unit.setRange(characteristics.getRange());
        
        // Calculate firepower based on unit characteristics
        int firepower = unitCharacteristicsService.calculateFirepower(
            unit.getVehicles(), 
            unit.getSupplyLevel(), 
            unit.getPersonnel(), 
            unit.getUnitType(), 
            unit.getFaction(),
            unit.getUnitRank() != null ? unit.getUnitRank() : uaigroup.mapservice.model.UnitRank.PLATOON
        );
        unit.setFirepower(firepower);
        
        GeneralUnit savedUnit = unitRepository.save(unit);
        notifyUnitUpdate(savedUnit);
        return savedUnit;
    }

    public List<GeneralUnit> getAllUnits() {
        return unitRepository.findAll();
    }

    public GeneralUnit getUnitById(String id) {
        return unitRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Unit not found with id: " + id));
    }

    public GeneralUnit updateUnit(UnitUpdateRequest request) {
        GeneralUnit existingUnit = getUnitById(request.id());
        GeneralUnit updatedUnit = unitMapper.updateFromRequest(existingUnit, request);
        
        // Update characteristics if unit type or faction changed
        var characteristics = unitCharacteristicsService.getCharacteristics(updatedUnit.getUnitType(), updatedUnit.getFaction());
        updatedUnit.setMobility(characteristics.getMobility());
        updatedUnit.setFirepowerBase(characteristics.getFirepowerBase());
        updatedUnit.setDefense(characteristics.getDefense());
        updatedUnit.setRange(characteristics.getRange());
        
        // Recalculate firepower based on updated characteristics
        int firepower = unitCharacteristicsService.calculateFirepower(
            updatedUnit.getVehicles(), 
            updatedUnit.getSupplyLevel(), 
            updatedUnit.getPersonnel(), 
            updatedUnit.getUnitType(), 
            updatedUnit.getFaction(),
            updatedUnit.getUnitRank() != null ? updatedUnit.getUnitRank() : uaigroup.mapservice.model.UnitRank.PLATOON
        );
        updatedUnit.setFirepower(firepower);
        
        GeneralUnit savedUnit = unitRepository.save(updatedUnit);
        notifyUnitUpdate(savedUnit);
        return savedUnit;
    }

    public void deleteUnitById(String id) {
        unitRepository.deleteById(id);
        messagingTemplate.convertAndSend("/topic/units/delete", id);
    }

    public void deleteAllUnits() {
        unitRepository.deleteAll();
        messagingTemplate.convertAndSend("/topic/units/clear", "all");
    }

    public List<GeneralUnit> getUnitsByIds(List<String> unitIds) {
        return unitRepository.findAllById(unitIds);
    }
    
    public List<GeneralUnit> getUnitsByUserId(String userId) {
        return unitRepository.findByUserId(userId);
    }

    // Obstacle methods
    
    public Obstacle createObstacle(ObstacleCreateRequest request, String userId) {
        Obstacle obstacle = obstacleMapper.toEntity(request);
        obstacle.setCreatedBy(userId);
        Obstacle savedObstacle = obstacleRepository.save(obstacle);
        notifyObstacleUpdate(savedObstacle);
        return savedObstacle;
    }
    
    public List<Obstacle> getObstaclesByUserId(String userId) {
        return obstacleRepository.findByCreatedBy(userId);
    }
    
    public List<Obstacle> getAllObstacles() {
        return obstacleRepository.findAll();
    }
    
    public Obstacle getObstacleById(String id) {
        return obstacleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Obstacle not found with id: " + id));
    }
    
    public Obstacle updateObstacle(ObstacleUpdateRequest request) {
        Obstacle existingObstacle = getObstacleById(request.id());
        Obstacle updatedObstacle = obstacleMapper.updateFromRequest(existingObstacle, request);
        Obstacle savedObstacle = obstacleRepository.save(updatedObstacle);
        notifyObstacleUpdate(savedObstacle);
        return savedObstacle;
    }
    
    public void deleteObstacleById(String id) {
        obstacleRepository.deleteById(id);
        messagingTemplate.convertAndSend("/topic/obstacles/delete", id);
    }
    
    public void deleteAllObstacles() {
        obstacleRepository.deleteAll();
        messagingTemplate.convertAndSend("/topic/obstacles/clear", "all");
    }
    
    // Action methods
    
    public Action createAction(ActionCreateRequest request) {
        Action action = actionMapper.toEntity(request);
        Action savedAction = actionRepository.save(action);
        notifyActionUpdate(savedAction);
        return savedAction;
    }
    
    public List<Action> getAllActions() {
        return actionRepository.findAll();
    }
    
    public List<Action> getActionsByUnitId(String unitId) {
        return actionRepository.findByUnitId(unitId);
    }
    
    public Action getActionById(String id) {
        return actionRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Action not found with id: " + id));
    }
    
    public Action updateAction(ActionUpdateRequest request) {
        Action existingAction = getActionById(request.id());
        Action updatedAction = actionMapper.updateFromRequest(existingAction, request);
        Action savedAction = actionRepository.save(updatedAction);
        notifyActionUpdate(savedAction);
        return savedAction;
    }
    
    public void deleteActionById(String id) {
        actionRepository.deleteById(id);
        messagingTemplate.convertAndSend("/topic/actions/delete", id);
    }
    
    public void deleteAllActions() {
        actionRepository.deleteAll();
        messagingTemplate.convertAndSend("/topic/actions/clear", "all");
    }
    
    // Private notification methods
    
    private void notifyUnitUpdate(GeneralUnit unit) {
        messagingTemplate.convertAndSend("/topic/units", unit);
    }
    
    private void notifyObstacleUpdate(Obstacle obstacle) {
        messagingTemplate.convertAndSend("/topic/obstacles", obstacle);
    }
    
    private void notifyActionUpdate(Action action) {
        messagingTemplate.convertAndSend("/topic/actions", action);
    }
    
    // Battle History methods
    
    public BattleHistory saveBattle(BattleSaveRequest request, String userId) {
        BattleHistory battle = new BattleHistory();
        battle.setUserId(userId);
        battle.setBattleName(request.battleName());
        
        List<GeneralUnit> units = getUnitsByUserId(userId);
        List<Obstacle> obstacles = getObstaclesByUserId(userId);
        

        
        battle.setUnits(units);
        battle.setObstacles(obstacles);
        return battleHistoryRepository.save(battle);
    }

    public List<BattleHistory> getUserBattles(String userId) {
        return battleHistoryRepository.findByUserId(userId);
    }

    public Map<String, Object> loadBattle(String battleId, String userId) {
        BattleHistory battle = battleHistoryRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));
        
        if (!battle.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        return Map.of(
            "units", battle.getUnits(),
            "obstacles", battle.getObstacles()
        );
    }

    public void deleteBattle(String battleId, String userId) {
        BattleHistory battle = battleHistoryRepository.findById(battleId)
            .orElseThrow(() -> new RuntimeException("Battle not found"));
        
        if (!battle.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        battleHistoryRepository.delete(battle);
    }
}