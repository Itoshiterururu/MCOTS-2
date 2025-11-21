package uaigroup.mapservice.controller.dto;

import jakarta.validation.constraints.NotBlank;

public record BattleSaveRequest(
    @NotBlank String battleName
) {}