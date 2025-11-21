package uaigroup.mapservice.model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "military_units")
public class GeneralUnit {
    @Id
    private String id;
    private String userId;
    private UnitType unitType;
    private Faction faction;
    private UnitRank unitRank;
    private Position position;
    private Status status;

    @Min(0)
    @Max(5000)
    private int personnel;
    @Min(0)
    @Max(500)
    private int vehicles;
    private int firepower;
    
    @Min(0)
    @Max(100)
    private int supplyLevel;
    @Min(0)
    @Max(100)
    private double morale;
    
    @Min(0)
    @Max(359)
    private int direction;
    
    // Unit characteristics (calculated from type)
    private int mobility;
    private int firepowerBase;
    private int defense;
    private int range;

    // Communication status
    private boolean hasCommsLink;           // Is connected to command network?
    private String linkedCommsUnitId;       // Which comms unit provides coverage?
    private LocalDateTime lastCommsCheck;   // When was connectivity last verified?
    @Min(0)
    @Max(100)
    private int commsStrength;              // Signal quality 0-100%

    // Field of Fire (for defensive positions and fire control)
    private FieldOfFire fieldOfFire;        // Defined sector of fire

    // Fire Mission (for artillery units)
    private String activeFireMissionId;     // Currently executing fire mission

    // Unit Hierarchy and Formation
    private String parentUnitId;            // ID of parent unit (e.g., company for platoon)
    private boolean isFormationHQ;          // Is this a formation headquarters/command post
    private FormationType formationType;    // Tactical formation type
    private int formationSpacing;           // Distance between units in meters (default 100m)
    private int formationOrientation;       // Formation facing direction in degrees

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}