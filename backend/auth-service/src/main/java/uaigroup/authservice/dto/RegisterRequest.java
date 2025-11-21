package uaigroup.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import uaigroup.authservice.validation.ValidRole;

@Data
public class RegisterRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;
    
    @NotBlank
    @Email
    private String email;
    
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    @ValidRole
    private String role = "OPERATOR";
}