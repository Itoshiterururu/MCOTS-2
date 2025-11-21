package uaigroup.mapservice.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;

@Slf4j
@Component
public class JwtUtil {
    
    @Value("${jwt.secret:myVerySecretKeyForMCOTSAuthService123456789}")
    private String secret;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
    
    public String getRoleFromToken(String token) {
        String role = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("role", String.class);
        
        // Validate role
        if (role == null || (!"ADMIN".equals(role) && !"OPERATOR".equals(role) && !"VIEWER".equals(role))) {
            log.warn("Invalid role in JWT token: {}", role);
            throw new RuntimeException("Invalid role in JWT token");
        }
        
        return role;
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}