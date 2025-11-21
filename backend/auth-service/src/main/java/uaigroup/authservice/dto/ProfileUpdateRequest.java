package uaigroup.authservice.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @Email(message = "Invalid email format")
    private String email;
}
