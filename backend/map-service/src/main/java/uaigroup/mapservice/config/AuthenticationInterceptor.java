package uaigroup.mapservice.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthenticationInterceptor implements HandlerInterceptor {
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        
        // Skip auth for test endpoint
        if ("/api/v1/map/test".equals(path)) {
            return true;
        }
        
        String username = (String) request.getAttribute("username");
        if (username == null) {
            response.setStatus(401);
            return false;
        }
        
        return true;
    }
}