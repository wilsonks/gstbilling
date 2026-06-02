package com.wilsonks.gstbilling;

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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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
                        // frontend shell/static assets
                        .requestMatchers(
                                "/",
                                "/login",
                                "/register",
                                "/dashboard",
                                "/companies",
                                "/users",
                                "/user-access",
                                "/products",
                                "/customers",
                                "/invoice-sequences",
                                "/invoices",
                                "/invoices/**",
                                "/proforma-invoices",
                                "/proforma-invoices/**",
                                "/credit-notes",
                                "/credit-notes/**",
                                "/debit-notes",
                                "/debit-notes/**",
                                "/index.html",
                                "/static/**",
                                "/assets/**",
                                "/docs/**",
                                "/*.js",
                                "/*.css",
                                "/favicon.ico"
                        ).permitAll()

                        // dev only
                        .requestMatchers("/h2-console/**").permitAll()

                        // auth
                        .requestMatchers("/api/auth/register").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/refresh").permitAll()
                        .requestMatchers("/api/auth/logout").authenticated()
                        .requestMatchers("/api/auth/switch-company").authenticated()

                        // platform
                        .requestMatchers("/api/platform/**").hasRole("SUPER_ADMIN")

                        // tenant read
                        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("STAFF", "MANAGER", "ADMIN")

                        // tenant write
                        .requestMatchers(HttpMethod.POST, "/api/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/**").hasAnyRole("MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/**").hasAnyRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .headers(h -> h.frameOptions(frame -> frame.sameOrigin()))
                .addFilterBefore(jwtSecurityFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(tenantAutoQuerySecurityFilter, JwtSecurityFilter.class);

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