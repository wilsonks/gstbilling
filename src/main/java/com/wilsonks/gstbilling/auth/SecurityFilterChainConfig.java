package com.wilsonks.gstbilling.auth;


import com.wilsonks.gstbilling.auth.token.JwtSecurityFilter;
import com.wilsonks.gstbilling.common.TenantAutoQuerySecurityFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
@Configuration
@RequiredArgsConstructor
public class SecurityFilterChainConfig {

    private final JwtSecurityFilter jwtSecurityFilter;
    private final TenantAutoQuerySecurityFilter tenantAutoQuerySecurityFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        //Allow static + frontend routes
                        .requestMatchers(
                                "/",
                                "/login",
                                "/dashboard",
                                "/register",
                                "/index.html",
                                "/static/**",
                                "/assets/**",
                                "/docs/**",
                                "/*.js",
                                "/*.css",
                                "/favicon.ico"
                        ).permitAll()

                        // Allow H2 console (for development)
                        .requestMatchers("/h2-console/**").permitAll()

                        // public endpoints
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()

                        //require authentication for these endpoints
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/switch-company").authenticated()

                        // ---- Platform (RBAC) ----
                        .requestMatchers("/api/platform/**").hasAnyRole("SUPER_ADMIN")

                        // ---- Tenant (RBAC) ----
                        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("MANAGER", "ADMIN")

                        // everything else requires authentication
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable()) // disable default login form
                .headers(h -> h.frameOptions(frame -> frame.sameOrigin())) // allow H2 console in iframes
                .addFilterBefore(jwtSecurityFilter, UsernamePasswordAuthenticationFilter.class)// JWT filter should run before Spring's authentication processing
                .addFilterAfter(tenantAutoQuerySecurityFilter, JwtSecurityFilter.class);// Tenant filter should run after JWT filter so it can read tenantId from JWT claims

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
