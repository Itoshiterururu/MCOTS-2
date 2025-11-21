package uaigroup.authservice.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = RoleValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidRole {
    String message() default "Invalid role. Must be ADMIN, OPERATOR, or VIEWER";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}