package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.ObstacleType;
import uaigroup.mapservice.model.Position;

public record ObstacleCreateRequest(
    Position startPosition,
    Position endPosition,
    ObstacleType type
) {
}