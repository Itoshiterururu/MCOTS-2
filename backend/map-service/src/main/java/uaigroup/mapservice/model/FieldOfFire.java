package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a unit's field of fire sector
 * Defines the area where a unit can effectively engage targets
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FieldOfFire {

    // Center direction (azimuth in degrees, 0-359, where 0 is North)
    private int centerAzimuth;

    // Left boundary (azimuth in degrees)
    private int leftAzimuth;

    // Right boundary (azimuth in degrees)
    private int rightAzimuth;

    // Maximum effective range in meters
    private int maxRange;

    // Minimum engagement range in meters (dead zone)
    private int minRange;

    // Whether this field of fire is currently active
    private boolean active;

    // Priority: PRIMARY, SECONDARY, FINAL_PROTECTIVE_FIRE
    private String priority;

    // Description/notes
    private String description;
}
