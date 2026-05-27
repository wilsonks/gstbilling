package com.wilsonks.gstbilling.platform.tenant;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository repo;

    public Tenant create(CreateTenantRequest req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Tenant name is required");
        }
        if (req.getGstin() == null || req.getGstin().isBlank()) {
            throw new IllegalArgumentException("Tenant GSTIN is required");
        }
        if (req.getContactEmail() == null || req.getContactEmail().isBlank()) {
            throw new IllegalArgumentException("Tenant contact email is required");
        }

        String name = req.getName().trim();
        String gstin = req.getGstin().trim().toUpperCase();
        String contactEmail = req.getContactEmail().trim().toLowerCase();

        if (repo.existsByGstinIgnoreCase(gstin)) {
            throw new IllegalArgumentException("Tenant with the same GSTIN already exists");
        }

        Tenant t = Tenant.builder()
                .name(name)
                .gstin(gstin)
                .contactEmail(contactEmail)
                .active(req.getActive() != null ? req.getActive() : true)
                .build();

        return repo.save(t);
    }

    public Tenant get(Long tenantId) {
        return repo.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));
    }

    public Page<Tenant> list(String q, Pageable pageable) {
        if (q == null || q.isBlank()) {
            return repo.findAll(pageable);
        } else {
            String query = q.trim().toLowerCase();
            return repo.findByNameContainingIgnoreCaseOrGstinContainingIgnoreCase(query, query, pageable);
        }
    }

    public TenantStats stats() {
        long total = repo.count();
        long active = repo.countByActiveTrue();
        long inactive = total - active;
        List<Tenant> recentTenants = repo.findAll(Pageable.ofSize(5)).getContent();
        return new TenantStats(total, active, inactive, recentTenants);
    }

    public Tenant update(Long tenantId, UpdateTenantRequest req) {
        Tenant t = get(tenantId);
        boolean updated = false;

        if (req.getName() != null && !req.getName().isBlank()) {
            t.setName(req.getName().trim());
            updated = true;
        }
        if (req.getGstin() != null && !req.getGstin().isBlank()) {
            t.setGstin(req.getGstin().trim().toUpperCase());
            updated = true;
        }
        if (req.getContactEmail() != null && !req.getContactEmail().isBlank()) {
            t.setContactEmail(req.getContactEmail().trim().toLowerCase());
            updated = true;
        }

        if (updated) {
            t = repo.save(t);
        }
        return t;

    }

    public Tenant deactivate(Long tenantId) {
        Tenant t = get(tenantId);
        if (t.isActive()) {
            t.setActive(false);
            t.setUpdatedAt(Instant.now());
            t = repo.save(t);
        }
        return t;
    }

    public Tenant reactivate(Long tenantId) {
        Tenant t = get(tenantId);
        if (!t.isActive()) {
            t.setActive(true);
            t.setUpdatedAt(Instant.now());
            t = repo.save(t);
        }
        return t;
    }
}
