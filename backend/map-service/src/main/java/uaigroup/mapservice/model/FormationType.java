package uaigroup.mapservice.model;

/**
 * Tactical formation types for unit positioning
 */
public enum FormationType {
    // Linear formations
    LINE,               // Units in a straight line
    COLUMN,             // Units in a single file

    // Offensive formations
    WEDGE,              // V-shape, point forward
    VEE,                // V-shape, open forward
    ECHELON_LEFT,       // Diagonal line, stepped left
    ECHELON_RIGHT,      // Diagonal line, stepped right

    // Defensive formations
    BOX,                // Square/rectangular formation
    CIRCLE,             // Circular defensive formation
    HORSESHOE,          // U-shape formation

    // Special formations
    DISPERSED,          // Scattered for area coverage
    STAGGERED_COLUMN,   // Column with offset units
    DIAMOND,            // Diamond shape

    // Custom
    CUSTOM              // User-defined positions
}
