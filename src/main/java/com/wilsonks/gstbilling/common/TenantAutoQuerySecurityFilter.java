package com.wilsonks.gstbilling.common;


import com.wilsonks.gstbilling.context.TenantContext;
import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class TenantAutoQuerySecurityFilter extends OncePerRequestFilter {

    private final EntityManager entityManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws IOException, ServletException {
        try {
            if (TenantContext.hasTenant()) {

                log.debug("Enabling tenant filter for tenantId: {}", TenantContext.get());
                // Enable the tenant filter for this request
                entityManager.unwrap(org.hibernate.Session.class)
                        .enableFilter("tenantFilter")//It enables the "tenantFilter" for the current Hibernate session, which is used to automatically filter database queries based on the tenantId.
                        .setParameter("tenantId", TenantContext.get());
            }
            filterChain.doFilter(request, response);
        } finally {
            // Ensure we disable the filter after the request is processed to prevent leakage
            try {
                log.debug("Disabling tenant filter for tenantId: {}", TenantContext.get());
                entityManager.unwrap(org.hibernate.Session.class).disableFilter("tenantFilter");
            } catch (Exception ignored) {
                // Session might already be closed, ignore any exceptions here
            }
        }
    }
}
