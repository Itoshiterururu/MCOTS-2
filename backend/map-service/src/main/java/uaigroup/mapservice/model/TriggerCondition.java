package uaigroup.mapservice.model;

public enum TriggerCondition {
    NONE,                       // No condition (for TIME_BASED or IMMEDIATE)
    UNIT_IN_RANGE,              // When enemy unit comes within range
    UNDER_ATTACK,               // When this unit takes fire
    SUPPLY_LOW,                 // Supply level below threshold
    MORALE_LOW,                 // Morale below threshold
    PREVIOUS_ACTION_COMPLETE,   // Previous script action completed
    UNIT_DESTROYED,             // Specific unit eliminated
    ALLIED_UNIT_IN_RANGE        // When friendly unit comes within range
}
