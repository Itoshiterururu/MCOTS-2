package uaigroup.mapservice.model;

public enum ActionStatus {
    PENDING,        // Action created but not yet started
    READY,          // Conditions met, waiting for execution
    EXECUTING,      // Currently being executed
    COMPLETED,      // Successfully completed
    FAILED,         // Failed to execute
    CANCELLED       // Manually cancelled
}
