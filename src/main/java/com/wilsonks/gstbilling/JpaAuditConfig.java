package com.wilsonks.gstbilling;

import com.wilsonks.gstbilling.auth.identity.User; // Ensure this import matches your User class
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class JpaAuditConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication instanceof AnonymousAuthenticationToken) {
                return Optional.of("system");
            }

            Object principal = authentication.getPrincipal();

            // Extract username if principal is your custom User domain object
            if (principal instanceof User) {
                // Replace .getUsername() with your custom User class getter if named differently (e.g., .getEmail())
                return Optional.ofNullable(((User) principal).getUsername())
                        .filter(name -> !name.isBlank())
                        .or(() -> Optional.of("system"));
            }

            // Fallback for standard String principals or UserDetails implementations
            return Optional.ofNullable(authentication.getName())
                    .filter(name -> !name.isBlank())
                    .or(() -> Optional.of("system"));
        };
    }
}