package uaigroup.mapservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uaigroup.mapservice.controller.dto.FieldOfFireRequest;
import uaigroup.mapservice.controller.dto.FireMissionRequest;
import uaigroup.mapservice.model.FieldOfFire;
import uaigroup.mapservice.model.FireMission;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.repository.FireMissionRepository;
import uaigroup.mapservice.repository.UnitRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/fire-control")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FireControlController {

    private final UnitRepository unitRepository;
    private final FireMissionRepository fireMissionRepository;

    /**
     * Set field of fire for a unit
     */
    @PutMapping("/units/{unitId}/field-of-fire")
    public ResponseEntity<GeneralUnit> setFieldOfFire(
            @PathVariable String unitId,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody FieldOfFireRequest request) {

        Optional<GeneralUnit> unitOpt = unitRepository.findById(unitId);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GeneralUnit unit = unitOpt.get();

        // Build field of fire
        FieldOfFire fieldOfFire = FieldOfFire.builder()
                .centerAzimuth(request.getCenterAzimuth())
                .leftAzimuth(request.getLeftAzimuth())
                .rightAzimuth(request.getRightAzimuth())
                .maxRange(request.getMaxRange())
                .minRange(request.getMinRange())
                .active(request.isActive())
                .priority(request.getPriority())
                .description(request.getDescription())
                .build();

        unit.setFieldOfFire(fieldOfFire);
        unit.setUpdatedAt(LocalDateTime.now());

        GeneralUnit savedUnit = unitRepository.save(unit);
        log.info("Set field of fire for unit {} by user {}", unitId, userId);

        return ResponseEntity.ok(savedUnit);
    }

    /**
     * Clear field of fire for a unit
     */
    @DeleteMapping("/units/{unitId}/field-of-fire")
    public ResponseEntity<GeneralUnit> clearFieldOfFire(
            @PathVariable String unitId,
            @RequestHeader("X-User-Id") String userId) {

        Optional<GeneralUnit> unitOpt = unitRepository.findById(unitId);
        if (unitOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        GeneralUnit unit = unitOpt.get();
        unit.setFieldOfFire(null);
        unit.setUpdatedAt(LocalDateTime.now());

        GeneralUnit savedUnit = unitRepository.save(unit);
        log.info("Cleared field of fire for unit {} by user {}", unitId, userId);

        return ResponseEntity.ok(savedUnit);
    }

    /**
     * Create a fire mission
     */
    @PostMapping("/fire-missions")
    public ResponseEntity<FireMission> createFireMission(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody FireMissionRequest request) {

        FireMission mission = FireMission.builder()
                .userId(userId)
                .artilleryUnitId(request.getArtilleryUnitId())
                .missionType(request.getMissionType())
                .targetCenter(request.getTargetCenter())
                .targetRadius(request.getTargetRadius())
                .targetPolygon(request.getTargetPolygon())
                .status("PLANNED")
                .roundsAllocated(request.getRoundsAllocated())
                .roundsFired(0)
                .priority(request.getPriority())
                .methodOfFire(request.getMethodOfFire())
                .timeOnTarget(request.getTimeOnTarget())
                .durationSeconds(request.getDurationSeconds())
                .effectsRadius(request.getEffectsRadius())
                .callSign(request.getCallSign())
                .observerUnitId(request.getObserverUnitId())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        FireMission savedMission = fireMissionRepository.save(mission);

        // Link mission to artillery unit
        if (request.getArtilleryUnitId() != null) {
            unitRepository.findById(request.getArtilleryUnitId()).ifPresent(unit -> {
                unit.setActiveFireMissionId(savedMission.getId());
                unitRepository.save(unit);
            });
        }

        log.info("Created fire mission {} for user {}", savedMission.getId(), userId);
        return ResponseEntity.ok(savedMission);
    }

    /**
     * Get all fire missions for user
     */
    @GetMapping("/fire-missions")
    public ResponseEntity<List<FireMission>> getUserFireMissions(
            @RequestHeader("X-User-Id") String userId) {
        List<FireMission> missions = fireMissionRepository.findByUserId(userId);
        return ResponseEntity.ok(missions);
    }

    /**
     * Get fire mission by ID
     */
    @GetMapping("/fire-missions/{missionId}")
    public ResponseEntity<FireMission> getFireMission(@PathVariable String missionId) {
        return fireMissionRepository.findById(missionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update fire mission status
     */
    @PutMapping("/fire-missions/{missionId}/status")
    public ResponseEntity<FireMission> updateFireMissionStatus(
            @PathVariable String missionId,
            @RequestParam String status) {

        Optional<FireMission> missionOpt = fireMissionRepository.findById(missionId);
        if (missionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FireMission mission = missionOpt.get();
        mission.setStatus(status);
        mission.setUpdatedAt(LocalDateTime.now());

        FireMission savedMission = fireMissionRepository.save(mission);
        log.info("Updated fire mission {} status to {}", missionId, status);

        return ResponseEntity.ok(savedMission);
    }

    /**
     * Delete fire mission
     */
    @DeleteMapping("/fire-missions/{missionId}")
    public ResponseEntity<Void> deleteFireMission(
            @PathVariable String missionId,
            @RequestHeader("X-User-Id") String userId) {

        Optional<FireMission> missionOpt = fireMissionRepository.findById(missionId);
        if (missionOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FireMission mission = missionOpt.get();

        // Clear mission from artillery unit
        if (mission.getArtilleryUnitId() != null) {
            unitRepository.findById(mission.getArtilleryUnitId()).ifPresent(unit -> {
                if (missionId.equals(unit.getActiveFireMissionId())) {
                    unit.setActiveFireMissionId(null);
                    unitRepository.save(unit);
                }
            });
        }

        fireMissionRepository.deleteById(missionId);
        log.info("Deleted fire mission {} by user {}", missionId, userId);

        return ResponseEntity.ok().build();
    }

    /**
     * Get active fire missions
     */
    @GetMapping("/fire-missions/active")
    public ResponseEntity<List<FireMission>> getActiveFireMissions(
            @RequestHeader("X-User-Id") String userId) {
        List<FireMission> missions = fireMissionRepository.findByUserIdAndStatus(userId, "FIRING");
        return ResponseEntity.ok(missions);
    }
}
