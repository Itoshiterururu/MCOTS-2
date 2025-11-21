package uaigroup.mapservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uaigroup.mapservice.controller.dto.FormationCreateRequest;
import uaigroup.mapservice.model.Formation;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.Position;
import uaigroup.mapservice.service.FormationService;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/formations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FormationController {

    private final FormationService formationService;

    /**
     * Create a new formation with HQ and subordinate units
     */
    @PostMapping
    public ResponseEntity<Formation> createFormation(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody FormationCreateRequest request) {

        try {
            Formation formation = formationService.createFormation(
                    userId,
                    request.getUnitType(),
                    request.getRank(),
                    request.getFaction(),
                    request.getHqPosition(),
                    request.getFormationType(),
                    request.getSpacing() > 0 ? request.getSpacing() : 100,
                    request.getOrientation()
            );

            log.info("Created formation {} for user {}", formation.getId(), userId);
            return ResponseEntity.ok(formation);
        } catch (IllegalArgumentException e) {
            log.error("Failed to create formation: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all formations for a user
     */
    @GetMapping
    public ResponseEntity<List<Formation>> getUserFormations(@RequestHeader("X-User-Id") String userId) {
        List<Formation> formations = formationService.getUserFormations(userId);
        return ResponseEntity.ok(formations);
    }

    /**
     * Get formation by ID
     */
    @GetMapping("/{formationId}")
    public ResponseEntity<Formation> getFormation(@PathVariable String formationId) {
        try {
            Formation formation = formationService.getFormation(formationId);
            return ResponseEntity.ok(formation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get subordinate units for a formation
     */
    @GetMapping("/{formationId}/subordinates")
    public ResponseEntity<List<GeneralUnit>> getSubordinateUnits(@PathVariable String formationId) {
        try {
            Formation formation = formationService.getFormation(formationId);
            List<GeneralUnit> subordinates = formationService.getSubordinateUnits(
                    formation.getHeadquartersUnitId()
            );
            return ResponseEntity.ok(subordinates);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Move entire formation to new position
     */
    @PutMapping("/{formationId}/move")
    public ResponseEntity<Void> moveFormation(
            @PathVariable String formationId,
            @RequestBody Position newHqPosition) {

        try {
            formationService.moveFormation(formationId, newHqPosition);
            log.info("Moved formation {} to new position", formationId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Failed to move formation: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete formation and all subordinate units
     */
    @DeleteMapping("/{formationId}")
    public ResponseEntity<Void> deleteFormation(@PathVariable String formationId) {
        try {
            formationService.deleteFormation(formationId);
            log.info("Deleted formation {}", formationId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.error("Failed to delete formation: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
