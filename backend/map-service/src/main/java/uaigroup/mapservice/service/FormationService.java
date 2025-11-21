package uaigroup.mapservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import uaigroup.mapservice.model.*;
import uaigroup.mapservice.repository.FormationRepository;
import uaigroup.mapservice.repository.UnitRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class FormationService {

    private final UnitRepository unitRepository;
    private final FormationRepository formationRepository;
    private final UnitCharacteristicsService characteristicsService;

    /**
     * Create a complete formation with HQ and subordinate units
     */
    public Formation createFormation(String userId, UnitType unitType, UnitRank rank, Faction faction,
                                    Position hqPosition, FormationType formationType, int spacing, int orientation) {

        // Determine number and rank of subordinate units based on parent rank
        int subordinateCount = getSubordinateCount(rank);
        UnitRank subordinateRank = getSubordinateRank(rank);

        if (subordinateCount == 0) {
            throw new IllegalArgumentException("Rank " + rank + " cannot have subordinate units");
        }

        // Create HQ unit
        GeneralUnit hqUnit = createUnit(userId, unitType, rank, faction, hqPosition);
        hqUnit.setFormationHQ(true);
        hqUnit.setFormationType(formationType);
        hqUnit.setFormationSpacing(spacing);
        hqUnit.setFormationOrientation(orientation);
        hqUnit = unitRepository.save(hqUnit);

        // Calculate positions for subordinate units
        List<Position> subordinatePositions = calculateFormationPositions(
                hqPosition, formationType, subordinateCount, spacing, orientation
        );

        // Create subordinate units
        List<String> subordinateIds = new ArrayList<>();
        for (int i = 0; i < subordinateCount; i++) {
            GeneralUnit subordinateUnit = createUnit(
                    userId, unitType, subordinateRank, faction, subordinatePositions.get(i)
            );
            subordinateUnit.setParentUnitId(hqUnit.getId());
            subordinateUnit.setDirection(orientation);
            subordinateUnit = unitRepository.save(subordinateUnit);
            subordinateIds.add(subordinateUnit.getId());
        }

        // Create formation record
        Formation formation = Formation.builder()
                .userId(userId)
                .name(rank + " " + unitType + " Formation")
                .headquartersUnitId(hqUnit.getId())
                .subordinateUnitIds(subordinateIds)
                .formationType(formationType)
                .spacing(spacing)
                .orientation(orientation)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return formationRepository.save(formation);
    }

    /**
     * Get number of subordinate units based on parent rank
     */
    private int getSubordinateCount(UnitRank rank) {
        switch (rank) {
            case BATTALION:
                return 3; // 3 companies
            case COMPANY:
                return 3; // 3 platoons
            case PLATOON:
                return 3; // 3 squads
            case SQUAD:
                return 0; // No subordinates
            default:
                return 0;
        }
    }

    /**
     * Get subordinate unit rank based on parent rank
     */
    private UnitRank getSubordinateRank(UnitRank parentRank) {
        switch (parentRank) {
            case BATTALION:
                return UnitRank.COMPANY;
            case COMPANY:
                return UnitRank.PLATOON;
            case PLATOON:
                return UnitRank.SQUAD;
            default:
                return null;
        }
    }

    /**
     * Create a single unit with characteristics
     */
    private GeneralUnit createUnit(String userId, UnitType unitType, UnitRank rank,
                                   Faction faction, Position position) {
        GeneralUnit unit = new GeneralUnit();
        unit.setUserId(userId);
        unit.setUnitType(unitType);
        unit.setUnitRank(rank);
        unit.setFaction(faction);
        unit.setPosition(position);
        unit.setStatus(Status.DEFENDING);

        // Set default values based on rank
        unit.setPersonnel(getDefaultPersonnel(rank));
        unit.setVehicles(getDefaultVehicles(unitType, rank));
        unit.setSupplyLevel(100);
        unit.setMorale(100);
        unit.setDirection(0);

        // Apply characteristics from service
        UnitCharacteristicsService.UnitCharacteristics characteristics =
            characteristicsService.getCharacteristics(unitType, faction);

        unit.setMobility(characteristics.getMobility());
        unit.setFirepowerBase(characteristics.getFirepowerBase());
        unit.setDefense(characteristics.getDefense());
        unit.setRange(characteristics.getRange());

        // Calculate firepower
        int calculatedFirepower = characteristicsService.calculateFirepower(
            unit.getVehicles(), unit.getSupplyLevel(), unit.getPersonnel(),
            unitType, faction, rank
        );
        unit.setFirepower(calculatedFirepower);

        return unit;
    }

    /**
     * Get default personnel count based on rank
     */
    private int getDefaultPersonnel(UnitRank rank) {
        switch (rank) {
            case SQUAD:
                return 10;
            case PLATOON:
                return 30;
            case COMPANY:
                return 120;
            case BATTALION:
                return 500;
            default:
                return 30;
        }
    }

    /**
     * Get default vehicle count based on unit type and rank
     */
    private int getDefaultVehicles(UnitType unitType, UnitRank rank) {
        int baseVehicles = 0;
        switch (unitType) {
            case TANKS:
                baseVehicles = 4;
                break;
            case MECHANIZED:
                baseVehicles = 4;
                break;
            case INFANTRY:
                baseVehicles = 2;
                break;
            case HOWITZER:
            case MORTAR:
                baseVehicles = 3;
                break;
            case RECONNAISSANCE:
                baseVehicles = 2;
                break;
            case UAV:
                baseVehicles = 0;
                break;
            default:
                baseVehicles = 1;
        }

        // Scale by rank
        switch (rank) {
            case SQUAD:
                return baseVehicles;
            case PLATOON:
                return baseVehicles * 3;
            case COMPANY:
                return baseVehicles * 10;
            case BATTALION:
                return baseVehicles * 30;
            default:
                return baseVehicles;
        }
    }

    /**
     * Calculate positions for units based on formation type
     */
    private List<Position> calculateFormationPositions(Position hqPosition, FormationType formationType,
                                                       int count, int spacing, int orientation) {
        List<Position> positions = new ArrayList<>();
        double spacingDegrees = spacing / 111000.0; // Convert meters to degrees (approximate)

        switch (formationType) {
            case LINE:
                positions = calculateLineFormation(hqPosition, count, spacingDegrees, orientation);
                break;
            case COLUMN:
                positions = calculateColumnFormation(hqPosition, count, spacingDegrees, orientation);
                break;
            case WEDGE:
                positions = calculateWedgeFormation(hqPosition, count, spacingDegrees, orientation);
                break;
            case VEE:
                positions = calculateVeeFormation(hqPosition, count, spacingDegrees, orientation);
                break;
            case ECHELON_LEFT:
                positions = calculateEchelonFormation(hqPosition, count, spacingDegrees, orientation, -45);
                break;
            case ECHELON_RIGHT:
                positions = calculateEchelonFormation(hqPosition, count, spacingDegrees, orientation, 45);
                break;
            case BOX:
                positions = calculateBoxFormation(hqPosition, count, spacingDegrees);
                break;
            case DISPERSED:
                positions = calculateDispersedFormation(hqPosition, count, spacingDegrees * 2);
                break;
            default:
                positions = calculateLineFormation(hqPosition, count, spacingDegrees, orientation);
        }

        return positions;
    }

    private List<Position> calculateLineFormation(Position hqPosition, int count, double spacing, int orientation) {
        List<Position> positions = new ArrayList<>();
        // Perpendicular to orientation
        double angle = Math.toRadians(orientation + 90);

        for (int i = 0; i < count; i++) {
            double offset = (i - (count - 1) / 2.0) * spacing;
            double lat = hqPosition.getLatitude() + offset * Math.sin(angle);
            double lng = hqPosition.getLongitude() + offset * Math.cos(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateColumnFormation(Position hqPosition, int count, double spacing, int orientation) {
        List<Position> positions = new ArrayList<>();
        double angle = Math.toRadians(orientation);

        for (int i = 0; i < count; i++) {
            double offset = (i + 1) * spacing; // Behind HQ
            double lat = hqPosition.getLatitude() - offset * Math.cos(angle);
            double lng = hqPosition.getLongitude() - offset * Math.sin(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateWedgeFormation(Position hqPosition, int count, double spacing, int orientation) {
        List<Position> positions = new ArrayList<>();
        double forwardAngle = Math.toRadians(orientation);
        double leftAngle = Math.toRadians(orientation - 45);
        double rightAngle = Math.toRadians(orientation + 45);

        for (int i = 0; i < count; i++) {
            double offset = (i / 2 + 1) * spacing;
            double angle = (i % 2 == 0) ? leftAngle : rightAngle;

            double lat = hqPosition.getLatitude() - offset * Math.cos(angle);
            double lng = hqPosition.getLongitude() - offset * Math.sin(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateVeeFormation(Position hqPosition, int count, double spacing, int orientation) {
        List<Position> positions = new ArrayList<>();
        double leftAngle = Math.toRadians(orientation + 135); // Behind and left
        double rightAngle = Math.toRadians(orientation + 225); // Behind and right

        for (int i = 0; i < count; i++) {
            double offset = (i / 2 + 1) * spacing;
            double angle = (i % 2 == 0) ? leftAngle : rightAngle;

            double lat = hqPosition.getLatitude() + offset * Math.cos(angle);
            double lng = hqPosition.getLongitude() + offset * Math.sin(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateEchelonFormation(Position hqPosition, int count, double spacing,
                                                     int orientation, int echelonAngle) {
        List<Position> positions = new ArrayList<>();
        double angle = Math.toRadians(orientation + echelonAngle);

        for (int i = 0; i < count; i++) {
            double offset = (i + 1) * spacing;
            double lat = hqPosition.getLatitude() - offset * Math.cos(angle);
            double lng = hqPosition.getLongitude() - offset * Math.sin(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateBoxFormation(Position hqPosition, int count, double spacing) {
        List<Position> positions = new ArrayList<>();
        int side = (int) Math.ceil(Math.sqrt(count));

        for (int i = 0; i < count; i++) {
            int row = i / side;
            int col = i % side;

            double lat = hqPosition.getLatitude() + (row - side / 2.0) * spacing;
            double lng = hqPosition.getLongitude() + (col - side / 2.0) * spacing /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    private List<Position> calculateDispersedFormation(Position hqPosition, int count, double spacing) {
        List<Position> positions = new ArrayList<>();

        for (int i = 0; i < count; i++) {
            // Random offset within spacing radius
            double angle = Math.random() * 2 * Math.PI;
            double distance = Math.random() * spacing;

            double lat = hqPosition.getLatitude() + distance * Math.cos(angle);
            double lng = hqPosition.getLongitude() + distance * Math.sin(angle) /
                        Math.cos(Math.toRadians(hqPosition.getLatitude()));

            Position pos = new Position();
            pos.setLatitude(lat);
            pos.setLongitude(lng);
            positions.add(pos);
        }

        return positions;
    }

    /**
     * Get formation by ID
     */
    public Formation getFormation(String formationId) {
        return formationRepository.findById(formationId)
                .orElseThrow(() -> new IllegalArgumentException("Formation not found: " + formationId));
    }

    /**
     * Get all formations for a user
     */
    public List<Formation> getUserFormations(String userId) {
        return formationRepository.findByUserId(userId);
    }

    /**
     * Get subordinate units for a parent unit
     */
    public List<GeneralUnit> getSubordinateUnits(String parentUnitId) {
        return unitRepository.findByParentUnitId(parentUnitId);
    }

    /**
     * Delete formation and all subordinate units
     */
    public void deleteFormation(String formationId) {
        Formation formation = getFormation(formationId);

        // Delete HQ unit
        unitRepository.deleteById(formation.getHeadquartersUnitId());

        // Delete subordinate units
        for (String subordinateId : formation.getSubordinateUnitIds()) {
            unitRepository.deleteById(subordinateId);
        }

        // Delete formation record
        formationRepository.deleteById(formationId);
    }

    /**
     * Move entire formation (HQ and subordinates maintain relative positions)
     */
    public void moveFormation(String formationId, Position newHqPosition) {
        Formation formation = getFormation(formationId);
        GeneralUnit hqUnit = unitRepository.findById(formation.getHeadquartersUnitId())
                .orElseThrow(() -> new IllegalArgumentException("HQ unit not found"));

        Position oldHqPosition = hqUnit.getPosition();
        double latDiff = newHqPosition.getLatitude() - oldHqPosition.getLatitude();
        double lngDiff = newHqPosition.getLongitude() - oldHqPosition.getLongitude();

        // Move HQ
        hqUnit.setPosition(newHqPosition);
        unitRepository.save(hqUnit);

        // Move subordinates maintaining relative positions
        List<GeneralUnit> subordinates = getSubordinateUnits(hqUnit.getId());
        for (GeneralUnit subordinate : subordinates) {
            Position newPos = new Position();
            newPos.setLatitude(subordinate.getPosition().getLatitude() + latDiff);
            newPos.setLongitude(subordinate.getPosition().getLongitude() + lngDiff);
            subordinate.setPosition(newPos);
            unitRepository.save(subordinate);
        }
    }
}
