package uaigroup.authservice.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import uaigroup.authservice.model.Role;

public class RoleValidator implements ConstraintValidator<ValidRole, String> {
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null validation
        }
        
        try {
            Role.valueOf(value.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}