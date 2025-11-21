package uaigroup.authservice.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import uaigroup.authservice.exception.InvalidJwtTokenException;
import uaigroup.authservice.exception.JwtTokenExpiredException;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {
    
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration:86400000}")
    private Long expiration;
    
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
    
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    public String getRoleFromToken(String token) {
        try {
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
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            throw new RuntimeException("JWT token expired", e);
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
            throw new RuntimeException("Malformed JWT token", e);
        } catch (SignatureException e) {
            log.warn("Invalid JWT signature: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT signature", e);
        } catch (JwtException e) {
            log.warn("JWT processing error: {}", e.getMessage());
            throw new RuntimeException("JWT processing error", e);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid JWT token format: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT token format", e);
        }
    }
    
    public String getUsernameFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
            throw new JwtTokenExpiredException("JWT token expired");
        } catch (MalformedJwtException | SignatureException | IllegalArgumentException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            throw new InvalidJwtTokenException("Invalid JWT token");
        } catch (JwtException e) {
            log.warn("JWT processing error: {}", e.getMessage());
            throw new InvalidJwtTokenException("Invalid JWT token");
        }
    }
    
    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.debug("JWT token expired: {}", e.getMessage());
            return false;
        } catch (MalformedJwtException e) {
            log.debug("Malformed JWT token: {}", e.getMessage());
            return false;
        } catch (SignatureException e) {
            log.debug("Invalid JWT signature: {}", e.getMessage());
            return false;
        } catch (JwtException e) {
            log.debug("JWT processing error: {}", e.getMessage());
            return false;
        } catch (IllegalArgumentException e) {
            log.debug("Invalid JWT token format: {}", e.getMessage());
            return false;
        }
    }
}