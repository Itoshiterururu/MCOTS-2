package uaigroup.mapservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import uaigroup.mapservice.model.Faction;
import uaigroup.mapservice.model.GeneralUnit;
import uaigroup.mapservice.model.Position;
import uaigroup.mapservice.model.UnitType;
import uaigroup.mapservice.repository.UnitRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommunicationService {

    @Autowired
    private UnitRepository unitRepository;

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculate distance between two positions using Haversine formula
     * @return distance in kilometers
     */
    public double calculateDistance(Position pos1, Position pos2) {
        double lat1 = Math.toRadians(pos1.getLatitude());
        double lat2 = Math.toRadians(pos2.getLatitude());
        double lon1 = Math.toRadians(pos1.getLongitude());
        double lon2 = Math.toRadians(pos2.getLongitude());

        double dLat = lat2 - lat1;
        double dLon = lon2 - lon1;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Check if a unit has communications coverage from friendly COMMUNICATIONS units
     */
    public boolean hasCommsCoverage(GeneralUnit unit) {
        // Communications units always have comms
        if (unit.getUnitType() == UnitType.COMMUNICATIONS) {
            return true;
        }

        List<GeneralUnit> commsUnits = unitRepository.findByFactionAndUnitType(
                unit.getFaction(),
                UnitType.COMMUNICATIONS
        );

        for (GeneralUnit commsUnit : commsUnits) {
            double distance = calculateDistance(unit.getPosition(), commsUnit.getPosition());
            // Range is in km, check if within coverage
            if (distance <= commsUnit.getRange()) {
                return true;
            }
        }
        return false;
    }

    /**
     * Find the closest communications unit providing coverage
     * @return the comms unit ID and signal strength, or null if no coverage
     */
    public CommsLinkInfo findBestCommsLink(GeneralUnit unit) {
        // Communications units link to themselves
        if (unit.getUnitType() == UnitType.COMMUNICATIONS) {
            return new CommsLinkInfo(unit.getId(), 100);
        }

        List<GeneralUnit> commsUnits = unitRepository.findByFactionAndUnitType(
                unit.getFaction(),
                UnitType.COMMUNICATIONS
        );

        String bestCommsId = null;
        double shortestDistance = Double.MAX_VALUE;
        int signalStrength = 0;

        for (GeneralUnit commsUnit : commsUnits) {
            double distance = calculateDistance(unit.getPosition(), commsUnit.getPosition());

            // Check if within range
            if (distance <= commsUnit.getRange() && distance < shortestDistance) {
                shortestDistance = distance;
                bestCommsId = commsUnit.getId();

                // Calculate signal strength: 100% at 0 distance, decreasing linearly
                double distanceRatio = distance / commsUnit.getRange();
                signalStrength = (int) Math.round((1 - distanceRatio * 0.5) * 100);
                signalStrength = Math.max(50, Math.min(100, signalStrength));
            }
        }

        if (bestCommsId != null) {
            return new CommsLinkInfo(bestCommsId, signalStrength);
        }
        return null;
    }

    /**
     * Update communications status for all units
     * This is scheduled to run periodically
     */
    @Scheduled(fixedRate = 30000) // Every 30 seconds
    public void updateAllCommsStatus() {
        List<GeneralUnit> allUnits = unitRepository.findAll();

        for (GeneralUnit unit : allUnits) {
            updateUnitCommsStatus(unit);
        }
    }

    /**
     * Update communications status for a single unit
     */
    public void updateUnitCommsStatus(GeneralUnit unit) {
        CommsLinkInfo linkInfo = findBestCommsLink(unit);

        if (linkInfo != null) {
            unit.setHasCommsLink(true);
            unit.setLinkedCommsUnitId(linkInfo.commsUnitId());
            unit.setCommsStrength(linkInfo.signalStrength());
        } else {
            unit.setHasCommsLink(false);
            unit.setLinkedCommsUnitId(null);
            unit.setCommsStrength(0);
        }

        unit.setLastCommsCheck(LocalDateTime.now());
        unitRepository.save(unit);
    }

    /**
     * Get all units without communications coverage for a specific faction
     */
    public List<GeneralUnit> getIsolatedUnits(Faction faction) {
        return unitRepository.findByFaction(faction).stream()
                .filter(unit -> !hasCommsCoverage(unit))
                .toList();
    }

    /**
     * Get communications coverage statistics for a faction
     */
    public CommsCoverageStats getCoverageStats(Faction faction) {
        List<GeneralUnit> factionUnits = unitRepository.findByFaction(faction);
        int totalUnits = factionUnits.size();
        int connectedUnits = 0;
        int avgSignalStrength = 0;

        for (GeneralUnit unit : factionUnits) {
            if (unit.isHasCommsLink()) {
                connectedUnits++;
                avgSignalStrength += unit.getCommsStrength();
            }
        }

        if (connectedUnits > 0) {
            avgSignalStrength /= connectedUnits;
        }

        double coveragePercentage = totalUnits > 0 ? (connectedUnits * 100.0 / totalUnits) : 0;

        return new CommsCoverageStats(totalUnits, connectedUnits, coveragePercentage, avgSignalStrength);
    }

    // Record classes for return values
    public record CommsLinkInfo(String commsUnitId, int signalStrength) {}

    public record CommsCoverageStats(
            int totalUnits,
            int connectedUnits,
            double coveragePercentage,
            int averageSignalStrength
    ) {}
}
