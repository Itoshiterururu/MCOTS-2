package uaigroup.authservice.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uaigroup.authservice.config.JwtUtil;
import uaigroup.authservice.dto.*;
import uaigroup.authservice.service.AuthService;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:5173}", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.register(request);
            setTokenCookie(response, authResponse.getToken());
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = authService.login(request);
            setTokenCookie(response, authResponse.getToken());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
    
    private void setTokenCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(false);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(86400);
        response.addCookie(cookie);
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Auth service is running");
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(HttpServletRequest request) {
        String username = extractUsername(request);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserProfileResponse profile = authService.getUserProfile(username);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            HttpServletRequest httpRequest) {
        String username = extractUsername(httpRequest);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserProfileResponse profile = authService.updateProfile(username, request);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            HttpServletRequest httpRequest) {
        String username = extractUsername(httpRequest);
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            authService.changePassword(username, request);
            return ResponseEntity.ok("Password changed successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String extractUsername(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                return jwtUtil.getUsernameFromToken(token);
            } catch (Exception e) {
                return null;
            }
        }

        // Try to get from cookie
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    try {
                        return jwtUtil.getUsernameFromToken(cookie.getValue());
                    } catch (Exception e) {
                        return null;
                    }
                }
            }
        }
        return null;
    }
}