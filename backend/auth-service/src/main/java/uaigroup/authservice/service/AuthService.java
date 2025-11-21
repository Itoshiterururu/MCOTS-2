package uaigroup.authservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import uaigroup.authservice.config.JwtUtil;
import uaigroup.authservice.dto.*;
import uaigroup.authservice.exception.InvalidCredentialsException;
import uaigroup.authservice.exception.UserAlreadyExistsException;
import uaigroup.authservice.model.Role;
import uaigroup.authservice.model.User;
import uaigroup.authservice.repository.UserRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.valueOf(request.getRole().toUpperCase()));
        
        userRepository.save(user);
        
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }
    
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    log.warn("Failed login attempt for username: {}", request.getUsername());
                    return new InvalidCredentialsException("Invalid credentials");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Failed login attempt for username: {}", request.getUsername());
            throw new InvalidCredentialsException("Invalid credentials");
        }

        log.info("Successful login for username: {}", user.getUsername());
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());
        return new AuthResponse(token, user.getUsername(), user.getRole().name());
    }

    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.isEnabled()
        );
    }

    public void changePassword(String username, PasswordChangeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user: {}", username);
    }

    public UserProfileResponse updateProfile(String username, ProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new UserAlreadyExistsException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        userRepository.save(user);
        log.info("Profile updated for user: {}", username);

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.isEnabled()
        );
    }
}