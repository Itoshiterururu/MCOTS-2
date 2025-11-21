package uaigroup.mapservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a military formation with headquarters and subordinate units
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "formations")
public class Formation {

    @Id
    private String id;

    // User who created the formation
    private String userId;

    // Formation name/designation
    private String name;

    // Headquarters unit ID
    private String headquartersUnitId;

    // List of subordinate unit IDs
    private List<String> subordinateUnitIds;

    // Formation configuration
    private FormationType formationType;
    private int spacing;  // Distance between units in meters
    private int orientation;  // Formation facing direction

    // Parent formation (e.g., battalion contains companies)
    private String parentFormationId;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
