package uaigroup.mapservice.controller.dto;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public record BattleAnalysisRequest(
    MultipartFile photo,
    List<String> unitIds
) {}