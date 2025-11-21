package uaigroup.mapservice.config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    
    private final JwtUtil jwtUtil;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        // Add CORS headers to all responses
        addCorsHeaders(response);
        
        // Handle CORS preflight requests
        if ("OPTIONS".equals(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        String token = null;
        
        // Try to get token from Authorization header first
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // Try to get token from cookies
            jakarta.servlet.http.Cookie[] cookies = request.getCookies();
            if (cookies != null) {
                for (jakarta.servlet.http.Cookie cookie : cookies) {
                    if ("token".equals(cookie.getName())) {
                        token = cookie.getValue();
                        break;
                    }
                }
            }
        }
        
        if (token != null) {
            
            try {
                if (jwtUtil.validateToken(token)) {
                    String username = jwtUtil.getUsernameFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);
                    
                    request.setAttribute("username", username);
                    request.setAttribute("role", role);
                } else {
                    String sanitizedUri = request.getRequestURI().replaceAll("[\r\n]", "_");
                    log.warn("Invalid JWT token for request: {}", sanitizedUri);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            } catch (ExpiredJwtException e) {
                log.warn("Expired JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (MalformedJwtException e) {
                log.warn("Malformed JWT token: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (SignatureException e) {
                log.warn("Invalid JWT signature: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (JwtException e) {
                log.warn("JWT processing error: {}", e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            } catch (Exception e) {
                log.error("Unexpected error during JWT validation: {}", e.getMessage(), e);
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                return;
            }
        } else {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        filterChain.doFilter(request, response);
    }
    
    private void addCorsHeaders(HttpServletResponse response) {
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
        response.setHeader("Access-Control-Allow-Credentials", "true");
    }
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/ws") || path.equals("/api/v1/map/test");
    }
}