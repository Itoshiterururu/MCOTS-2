package uaigroup.mapservice.controller.dto;

import lombok.Data;
import uaigroup.mapservice.model.Position;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class FireMissionRequest {
    private String artilleryUnitId;
    private String missionType; // SUPPRESSION, DESTRUCTION, INTERDICTION, HARASSMENT, SMOKE, ILLUMINATION
    private Position targetCenter;
    private int targetRadius;
    private List<Position> targetPolygon;
    private int roundsAllocated;
    private String priority; // ROUTINE, PRIORITY, IMMEDIATE, FLASH
    private String methodOfFire; // AREA, POINT, LINEAR
    private LocalDateTime timeOnTarget;
    private int durationSeconds;
    private int effectsRadius;
    private String callSign;
    private String observerUnitId;
    private String description;
}
