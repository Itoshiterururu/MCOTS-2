package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.Faction;

public record ScriptCreateRequest(
    String name,
    String description,
    Faction targetFaction
) {}
