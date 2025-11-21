package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents an artillery fire mission
 * Defines target areas and fire support zones
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fire_missions")
public class FireMission {

    @Id
    private String id;

    // Artillery unit executing this mission
    private String artilleryUnitId;

    // User who created the mission
    private String userId;

    // Mission type: SUPPRESSION, DESTRUCTION, INTERDICTION, HARASSMENT, SMOKE, ILLUMINATION
    private String missionType;

    // Target area center point
    private Position targetCenter;

    // Target area radius in meters
    private int targetRadius;

    // Alternative: polygon for irregular shaped target area
    private List<Position> targetPolygon;

    // Fire mission status: PLANNED, READY, FIRING, COMPLETE, CANCELLED
    private String status;

    // Number of rounds to fire
    private int roundsAllocated;

    // Rounds fired so far
    private int roundsFired;

    // Priority: ROUTINE, PRIORITY, IMMEDIATE, FLASH
    private String priority;

    // Method of fire: AREA, POINT, LINEAR
    private String methodOfFire;

    // Time on target (when to fire)
    private LocalDateTime timeOnTarget;

    // Duration of fire mission in seconds
    private int durationSeconds;

    // Effects radius (danger zone)
    private int effectsRadius;

    // Call sign / identifier
    private String callSign;

    // Observer unit ID (who called for fire)
    private String observerUnitId;

    // Mission description
    private String description;

    // Created timestamp
    private LocalDateTime createdAt;

    // Last updated timestamp
    private LocalDateTime updatedAt;
}
