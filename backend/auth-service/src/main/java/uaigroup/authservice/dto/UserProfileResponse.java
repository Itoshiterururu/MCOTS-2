package uaigroup.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String role;
    private LocalDateTime createdAt;
    private boolean enabled;
}
