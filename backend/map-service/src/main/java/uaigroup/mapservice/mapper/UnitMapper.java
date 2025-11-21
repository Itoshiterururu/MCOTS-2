package uaigroup.mapservice.mapper;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import uaigroup.mapservice.controller.dto.UnitCreateRequest;
import uaigroup.mapservice.controller.dto.UnitUpdateRequest;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.Position;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UnitMapper {
    
    
    public GeneralUnit toEntity(UnitCreateRequest request) {
        if (request == null || request.position() == null) {
            throw new IllegalArgumentException("Request and position cannot be null");
        }
        
        GeneralUnit unit = new GeneralUnit();
        
        unit.setId(UUID.randomUUID().toString());
        unit.setUnitType(request.unitType());
        unit.setFaction(request.faction());
        unit.setUnitRank(request.unitRank());
        
        Position pos = new Position(
            request.position().getLatitude(),
            request.position().getLongitude());
        unit.setPosition(pos);

        unit.setStatus(request.status());
        unit.setPersonnel(request.personnel());
        unit.setVehicles(request.vehicles());
        unit.setFirepower(request.firepower());
        unit.setSupplyLevel(request.supplyLevel());
        unit.setMorale(request.morale());
        unit.setDirection(request.direction());
        
        return unit;
    }
    
    public GeneralUnit updateFromRequest(GeneralUnit existingUnit, UnitUpdateRequest request) {
        if (request.position() != null) {
            existingUnit.setPosition(request.position());
        }
        existingUnit.setStatus(request.status());
        existingUnit.setPersonnel(request.personnel());
        existingUnit.setVehicles(request.vehicles());
        existingUnit.setFirepower(request.firepower());
        existingUnit.setSupplyLevel(request.supplyLevel());
        existingUnit.setMorale(request.morale());
        if (request.unitRank() != null) {
            existingUnit.setUnitRank(request.unitRank());
        }
        existingUnit.setDirection(request.direction());
        
        return existingUnit;
    }
}