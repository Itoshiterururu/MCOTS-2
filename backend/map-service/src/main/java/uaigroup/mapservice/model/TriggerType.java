package uaigroup.mapservice.model;

public enum TriggerType {
    TIME_BASED,         // Execute after specified delay
    CONDITION_BASED,    // Execute when condition is met
    MANUAL,             // Triggered manually by user
    IMMEDIATE           // Execute immediately when script starts
}
