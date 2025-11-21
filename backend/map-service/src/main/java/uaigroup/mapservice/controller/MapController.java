package uaigroup.mapservice.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import uaigroup.mapservice.controller.dto.ActionCreateRequest;
import uaigroup.mapservice.controller.dto.ActionUpdateRequest;
import uaigroup.mapservice.controller.dto.ObstacleCreateRequest;
import uaigroup.mapservice.controller.dto.ObstacleUpdateRequest;
import uaigroup.mapservice.controller.dto.UnitCreateRequest;
import uaigroup.mapservice.controller.dto.UnitUpdateRequest;
import uaigroup.mapservice.controller.dto.UnitBatchRequest;
import uaigroup.mapservice.controller.dto.BattleSaveRequest;
import uaigroup.mapservice.model.Action;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.Obstacle;
import uaigroup.mapservice.model.BattleHistory;
import uaigroup.mapservice.model.Faction;
import uaigroup.mapservice.service.MapService;
import uaigroup.mapservice.service.CommunicationService;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/map")
@RequiredArgsConstructor
public class MapController {

    private final MapService mapService;
    private final CommunicationService communicationService;

    // Units endpoints
    @PostMapping("/units")
    public ResponseEntity<GeneralUnit> createUnit(@Valid @RequestBody UnitCreateRequest request, 
                                                 HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(mapService.createUnit(request, username));
    }

    @GetMapping("/units")
    public ResponseEntity<List<GeneralUnit>> getAllUnits(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        String role = (String) httpRequest.getAttribute("role");
        if (username == null || role == null) {
            return ResponseEntity.status(401).build();
        }
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(mapService.getAllUnits());
        } else {
            return ResponseEntity.ok(mapService.getUnitsByUserId(username));
        }
    }

    @DeleteMapping("/units/all")
    public ResponseEntity<Void> deleteAllUnits(HttpServletRequest httpRequest) {
        if (!isAdmin(httpRequest)) return ResponseEntity.status(403).build();
        mapService.deleteAllUnits();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/units/{id}")
    public ResponseEntity<GeneralUnit> getUnitById(@PathVariable String id, HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        String role = (String) httpRequest.getAttribute("role");
        GeneralUnit unit = mapService.getUnitById(id);
        if (unit == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"ADMIN".equals(role) && !username.equals(unit.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(unit);
    }

    @PutMapping("/units/{id}")
    public ResponseEntity<GeneralUnit> updateUnit(
            @PathVariable String id,
            @Valid @RequestBody UnitUpdateRequest request,
            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        String role = (String) httpRequest.getAttribute("role");
        GeneralUnit unit = mapService.getUnitById(id);
        if (unit == null) {
            return ResponseEntity.notFound().build();
        }
        if (!"ADMIN".equals(role) && !username.equals(unit.getUserId())) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(mapService.updateUnit(request));
    }

    @DeleteMapping("/units/{id}")
    public ResponseEntity<Void> deleteUnit(@PathVariable String id, HttpServletRequest httpRequest) {
        mapService.deleteUnitById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/units/batch")
    public ResponseEntity<List<GeneralUnit>> getUnitsByIds(@Valid @RequestBody UnitBatchRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(mapService.getUnitsByIds(request.getUnitIds()));
    }

    // Obstacles endpoints
    @PostMapping("/obstacles")
    public ResponseEntity<Obstacle> createObstacle(@Valid @RequestBody ObstacleCreateRequest request,
                                                  HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        return ResponseEntity.ok(mapService.createObstacle(request, username));
    }

    @GetMapping("/obstacles")
    public ResponseEntity<List<Obstacle>> getAllObstacles(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        String role = (String) httpRequest.getAttribute("role");
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(mapService.getAllObstacles());
        } else {
            return ResponseEntity.ok(mapService.getObstaclesByUserId(username));
        }
    }

    @DeleteMapping("/obstacles/all")
    public ResponseEntity<Void> deleteAllObstacles() {
        mapService.deleteAllObstacles();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/obstacles/{id}")
    public ResponseEntity<Obstacle> getObstacleById(@PathVariable String id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(mapService.getObstacleById(id));
    }

    @PutMapping("/obstacles/{id}")
    public ResponseEntity<Obstacle> updateObstacle(
            @PathVariable String id,
            @Valid @RequestBody ObstacleUpdateRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(mapService.updateObstacle(request));
    }

    @DeleteMapping("/obstacles/{id}")
    public ResponseEntity<Void> deleteObstacle(@PathVariable String id, HttpServletRequest httpRequest) {
        mapService.deleteObstacleById(id);
        return ResponseEntity.noContent().build();
    }

    // Actions endpoints
    @PostMapping("/actions")
    public ResponseEntity<Action> createAction(@Valid @RequestBody ActionCreateRequest request, HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.createAction(request));
    }

    @GetMapping("/actions")
    public ResponseEntity<List<Action>> getAllActions(HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.getAllActions());
    }
    
    @GetMapping("/actions/unit/{unitId}")
    public ResponseEntity<List<Action>> getActionsByUnitId(@PathVariable String unitId, HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.getActionsByUnitId(unitId));
    }

    @DeleteMapping("/actions/all")
    public ResponseEntity<Void> deleteAllActions(HttpServletRequest httpRequest) {
        if (!isAdmin(httpRequest)) return ResponseEntity.status(403).build();
        mapService.deleteAllActions();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/actions/{id}")
    public ResponseEntity<Action> getActionById(@PathVariable String id, HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        Action action = mapService.getActionById(id);
        return action != null ? ResponseEntity.ok(action) : ResponseEntity.notFound().build();
    }

    @PutMapping("/actions/{id}")
    public ResponseEntity<Action> updateAction(@PathVariable String id, @Valid @RequestBody ActionUpdateRequest request, HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        Action action = mapService.getActionById(id);
        return action != null ? ResponseEntity.ok(mapService.updateAction(request)) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/actions/{id}")
    public ResponseEntity<Void> deleteAction(@PathVariable String id, HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        mapService.deleteActionById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean isAuthenticated(HttpServletRequest request) {
        if (request == null) return false;
        return request.getAttribute("username") != null && request.getAttribute("role") != null;
    }

    private boolean isAdmin(HttpServletRequest request) {
        if (request == null) return false;
        return "ADMIN".equals(request.getAttribute("role"));
    }
    
    // Battle History endpoints
    @PostMapping("/battles")
    public ResponseEntity<BattleHistory> saveBattle(@Valid @RequestBody BattleSaveRequest request, 
                                                   HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.saveBattle(request, username));
    }

    @GetMapping("/battles")
    public ResponseEntity<List<BattleHistory>> getUserBattles(HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.getUserBattles(username));
    }

    @PostMapping("/battles/{id}/load")
    public ResponseEntity<Map<String, Object>> loadBattle(@PathVariable String id, 
                                                         HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(mapService.loadBattle(id, username));
    }

    @DeleteMapping("/battles/{id}")
    public ResponseEntity<Void> deleteBattle(@PathVariable String id, 
                                            HttpServletRequest httpRequest) {
        String username = (String) httpRequest.getAttribute("username");
        if (username == null) return ResponseEntity.status(401).build();
        mapService.deleteBattle(id, username);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Map service is running");
    }

    // Communications endpoints
    @GetMapping("/communications/stats/{faction}")
    public ResponseEntity<CommunicationService.CommsCoverageStats> getCommsCoverageStats(
            @PathVariable String faction,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        try {
            Faction factionEnum = Faction.valueOf(faction.toUpperCase());
            return ResponseEntity.ok(communicationService.getCoverageStats(factionEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/communications/isolated/{faction}")
    public ResponseEntity<List<GeneralUnit>> getIsolatedUnits(
            @PathVariable String faction,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        try {
            Faction factionEnum = Faction.valueOf(faction.toUpperCase());
            return ResponseEntity.ok(communicationService.getIsolatedUnits(factionEnum));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/communications/refresh")
    public ResponseEntity<String> refreshAllCommsStatus(HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        communicationService.updateAllCommsStatus();
        return ResponseEntity.ok("Communications status refreshed for all units");
    }

    @PostMapping("/communications/refresh/{unitId}")
    public ResponseEntity<GeneralUnit> refreshUnitCommsStatus(
            @PathVariable String unitId,
            HttpServletRequest httpRequest) {
        if (!isAuthenticated(httpRequest)) return ResponseEntity.status(401).build();
        GeneralUnit unit = mapService.getUnitById(unitId);
        if (unit == null) {
            return ResponseEntity.notFound().build();
        }
        communicationService.updateUnitCommsStatus(unit);
        return ResponseEntity.ok(unit);
    }
}