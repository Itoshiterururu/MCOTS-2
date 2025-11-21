package uaigroup.mapservice.controller.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import uaigroup.mapservice.model.Position;
import uaigroup.mapservice.model.Status;
import uaigroup.mapservice.model.UnitRank;

import java.time.LocalDateTime;

public record UnitUpdateRequest(
    String id,
    Position position,
    Status status,
    int personnel,
    int vehicles,
    int firepower,
    @Min(0) @Max(100)
    int supplyLevel,
    @Min(0) @Max(100)
    double morale,
    UnitRank unitRank,
    @Min(0) @Max(359)
    int direction,
    LocalDateTime updatedAt
) {}