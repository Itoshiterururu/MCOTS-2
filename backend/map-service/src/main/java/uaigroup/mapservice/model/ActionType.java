package uaigroup.mapservice.model;

public enum ActionType {
    MOVE,           // Move to target position
    ATTACK,         // Attack target unit or position
    DEFEND,         // Hold and defend current position
    RETREAT,        // Fall back to safer position
    RECON,          // Scout and gather intelligence
    SUPPLY,         // Resupply operation
    AMBUSH,         // Wait in concealment and attack
    FLANK,          // Move around enemy position
    SUPPORT_FIRE,   // Provide fire support to other units
    HOLD_FIRE,      // Do not engage, maintain concealment
    REGROUP         // Rally scattered forces
}
