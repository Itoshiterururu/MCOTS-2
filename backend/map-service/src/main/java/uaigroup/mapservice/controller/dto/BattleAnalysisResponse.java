package uaigroup.mapservice.controller.dto;

import java.util.Map;

public record BattleAnalysisResponse(
    Map<String, Object> unitData,
    String description
) {}