package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.ObstacleType;
import uaigroup.mapservice.model.Position;

import java.time.LocalDateTime;

public record ObstacleUpdateRequest(
    String id,
    Position startPosition,
    Position endPosition,
    ObstacleType type,
    LocalDateTime updatedAt
) {}