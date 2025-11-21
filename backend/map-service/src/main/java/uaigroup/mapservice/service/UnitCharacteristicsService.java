package uaigroup.mapservice.service;

import uaigroup.mapservice.model.UnitType;
import uaigroup.mapservice.model.Faction;
import uaigroup.mapservice.model.UnitRank;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.HashMap;

@Service
public class UnitCharacteristicsService {
    
    private static final Map<String, UnitCharacteristics> CHARACTERISTICS = new HashMap<>();
    
    static {
        // Blue Force
        CHARACTERISTICS.put("INFANTRY_BLUE_FORCE", new UnitCharacteristics(6, 7, 5, 2));
        CHARACTERISTICS.put("MECHANIZED_BLUE_FORCE", new UnitCharacteristics(8, 8, 7, 3));
        CHARACTERISTICS.put("TANKS_BLUE_FORCE", new UnitCharacteristics(4, 10, 9, 4));
        CHARACTERISTICS.put("COMMUNICATIONS_BLUE_FORCE", new UnitCharacteristics(7, 2, 3, 8));
        CHARACTERISTICS.put("ANTI_TANK_BLUE_FORCE", new UnitCharacteristics(5, 9, 4, 5));
        CHARACTERISTICS.put("RECONNAISSANCE_BLUE_FORCE", new UnitCharacteristics(10, 3, 2, 6));
        CHARACTERISTICS.put("UAV_BLUE_FORCE", new UnitCharacteristics(10, 2, 1, 10)); // БПЛА може нападати
        CHARACTERISTICS.put("AIR_DEFENSE_BLUE_FORCE", new UnitCharacteristics(3, 8, 6, 7));
        CHARACTERISTICS.put("HOWITZER_BLUE_FORCE", new UnitCharacteristics(2, 10, 4, 15));
        CHARACTERISTICS.put("MORTAR_BLUE_FORCE", new UnitCharacteristics(4, 7, 3, 8));
        CHARACTERISTICS.put("ENGINEER_BLUE_FORCE", new UnitCharacteristics(5, 4, 5, 2)); // Інженери мають вибухівку
        CHARACTERISTICS.put("REPAIR_BLUE_FORCE", new UnitCharacteristics(6, 2, 3, 1)); // Мінімальна самооборона
        CHARACTERISTICS.put("SUPPLY_BLUE_FORCE", new UnitCharacteristics(7, 3, 4, 3)); // Охорона конвою
        CHARACTERISTICS.put("MEDICAL_BLUE_FORCE", new UnitCharacteristics(8, 2, 2, 2)); // Мінімальна самооборона
        CHARACTERISTICS.put("LOGISTICS_BLUE_FORCE", new UnitCharacteristics(6, 3, 4, 3)); // Охорона баз
        
        // Red Force - same characteristics
        CHARACTERISTICS.put("INFANTRY_RED_FORCE", new UnitCharacteristics(6, 7, 5, 2));
        CHARACTERISTICS.put("MECHANIZED_RED_FORCE", new UnitCharacteristics(8, 8, 7, 3));
        CHARACTERISTICS.put("TANKS_RED_FORCE", new UnitCharacteristics(4, 10, 9, 4));
        CHARACTERISTICS.put("COMMUNICATIONS_RED_FORCE", new UnitCharacteristics(7, 2, 3, 8));
        CHARACTERISTICS.put("ANTI_TANK_RED_FORCE", new UnitCharacteristics(5, 9, 4, 5));
        CHARACTERISTICS.put("RECONNAISSANCE_RED_FORCE", new UnitCharacteristics(10, 3, 2, 6));
        CHARACTERISTICS.put("UAV_RED_FORCE", new UnitCharacteristics(10, 2, 1, 10));
        CHARACTERISTICS.put("AIR_DEFENSE_RED_FORCE", new UnitCharacteristics(3, 8, 6, 7));
        CHARACTERISTICS.put("HOWITZER_RED_FORCE", new UnitCharacteristics(2, 10, 4, 15));
        CHARACTERISTICS.put("MORTAR_RED_FORCE", new UnitCharacteristics(4, 7, 3, 8));
        CHARACTERISTICS.put("ENGINEER_RED_FORCE", new UnitCharacteristics(5, 4, 5, 2));
        CHARACTERISTICS.put("REPAIR_RED_FORCE", new UnitCharacteristics(6, 2, 3, 1));
        CHARACTERISTICS.put("SUPPLY_RED_FORCE", new UnitCharacteristics(7, 3, 4, 3));
        CHARACTERISTICS.put("MEDICAL_RED_FORCE", new UnitCharacteristics(8, 2, 2, 2));
        CHARACTERISTICS.put("LOGISTICS_RED_FORCE", new UnitCharacteristics(6, 3, 4, 3));
    }
    
    public UnitCharacteristics getCharacteristics(UnitType unitType, Faction faction) {
        String key = unitType.name() + "_" + faction.name();
        return CHARACTERISTICS.getOrDefault(key, new UnitCharacteristics(5, 5, 5, 3));
    }
    
    public int calculateFirepower(int vehicles, int supplyLevel, int personnel, UnitType unitType, Faction faction, UnitRank unitRank) {
        UnitCharacteristics chars = getCharacteristics(unitType, faction);
        
        // Більш реалістичні коефіцієнти
        double equipmentFactor = Math.max(0.3, Math.min(vehicles / 5.0, 2.0)); // Мінімум 0.3
        double supplyFactor = Math.max(0.5, supplyLevel / 100.0); // Мінімум 0.5
        double personnelFactor = Math.max(0.4, Math.min(personnel / 30.0, 2.0)); // Мінімум 0.4
        
        // Масштабування по рангу
        double rankMultiplier = getRankMultiplier(unitRank);
        
        // Базовий множник для всіх підрозділів
        double baseFactor = 5.0;
        
        return (int) Math.round(chars.getFirepowerBase() * equipmentFactor * supplyFactor * personnelFactor * baseFactor * rankMultiplier);
    }
    
    /**
     * Отримати множник для рангу підрозділу
     */
    public double getRankMultiplier(UnitRank rank) {
        switch (rank) {
            case SQUAD: return 0.3;
            case PLATOON: return 1.0;
            case COMPANY: return 3.0;
            case BATTALION: return 8.0;
            default: return 1.0;
        }
    }
    
    /**
     * Отримати базові значення personnel для рангу
     */
    public int getBasePersonnel(UnitRank rank) {
        switch (rank) {
            case SQUAD: return 10;
            case PLATOON: return 30;
            case COMPANY: return 120;
            case BATTALION: return 500;
            default: return 30;
        }
    }
    
    /**
     * Отримати базові значення vehicles для рангу
     */
    public int getBaseVehicles(UnitRank rank) {
        switch (rank) {
            case SQUAD: return 1;
            case PLATOON: return 3;
            case COMPANY: return 12;
            case BATTALION: return 50;
            default: return 3;
        }
    }
    
    public static class UnitCharacteristics {
        private final int mobility;
        private final int firepowerBase;
        private final int defense;
        private final int range;
        
        public UnitCharacteristics(int mobility, int firepowerBase, int defense, int range) {
            this.mobility = mobility;
            this.firepowerBase = firepowerBase;
            this.defense = defense;
            this.range = range;
        }
        
        public int getMobility() { return mobility; }
        public int getFirepowerBase() { return firepowerBase; }
        public int getDefense() { return defense; }
        public int getRange() { return range; }
    }
}