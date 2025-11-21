package uaigroup.mapservice.controller.dto;

import uaigroup.mapservice.model.Faction;
import uaigroup.mapservice.model.Position;
import uaigroup.mapservice.model.Status;
import uaigroup.mapservice.model.UnitType;
import uaigroup.mapservice.model.UnitRank;

public record UnitCreateRequest(UnitType unitType, Faction faction, UnitRank unitRank, Position position, Status status,
        int personnel, int vehicles, int firepower, int supplyLevel, double morale, int direction) {
}