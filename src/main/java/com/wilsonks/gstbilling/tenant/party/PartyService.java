package com.wilsonks.gstbilling.tenant.party;

import com.wilsonks.gstbilling.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PartyService {

    private final PartyRepository repo;

    public PartyResponse create(PartyRequest req) {
        Party p = new Party();
        apply(p, req);

        validate(p, null);
        Party saved = repo.save(p);
        return toResponse(saved);
    }

    public PartyResponse update(Long id, PartyRequest req) {
        Party p = repo.findById(id).orElseThrow(() -> new NotFoundException("Party not found"));
        apply(p, req);

        validate(p, id);
        Party saved = repo.save(p);
        return toResponse(saved);
    }

    public PartyResponse get(Long id) {
        return toResponse(repo.findById(id).orElseThrow(() -> new NotFoundException("Party not found")));
    }

    public Page<PartyResponse> list(String query, Boolean active, Pageable pageable) {
        Page<Party> page;

        boolean hasQuery = query != null && !query.isBlank();
        if (hasQuery && active != null) {
            page = repo.findByNameContainingIgnoreCaseAndIsActive(query.trim(), active, pageable);
        } else if (hasQuery) {
            page = repo.findByNameContainingIgnoreCase(query.trim(), pageable);
        } else if (active != null) {
            page = repo.findByIsActive(active, pageable);
        } else {
            page = repo.findAll(pageable);
        }

        return page.map(this::toResponse);
    }

    public PartyResponse deactivate(Long id) {
        Party p = repo.findById(id).orElseThrow(() -> new NotFoundException("Party not found"));
        p.setActive(false);
        return toResponse(repo.save(p));
    }

    public PartyResponse activate(Long id) {
        Party p = repo.findById(id).orElseThrow(() -> new NotFoundException("Party not found"));
        p.setActive(true);
        return toResponse(repo.save(p));
    }

    private void validate(Party p, Long currentId) {
        if (p.getName() == null || p.getName().isBlank()) {
            throw new IllegalArgumentException("Party name is required");
        }
        if (p.getPartyType() == null) {
            throw new IllegalArgumentException("Party type is required");
        }

        String gstin = normalize(p.getGstin());
        if (gstin != null) {
            var existing = repo.findByGstinIgnoreCase(gstin);
            if (existing.isPresent() && (currentId == null || !existing.get().getId().equals(currentId))) {
                throw new IllegalArgumentException("GSTIN already exists");
            }
        }
    }

    private void apply(Party p, PartyRequest req) {
        p.setName(req.name() == null ? null : req.name().trim());
        p.setPartyType(req.partyType());

        p.setGstin(normalize(req.gstin()));
        p.setPhone(normalize(req.phone()));
        p.setEmail(normalize(req.email()));
        p.setAddressLine1(normalize(req.addressLine1()));
        p.setAddressLine2(normalize(req.addressLine2()));
        p.setCity(normalize(req.city()));
        p.setStateCode(normalize(req.stateCode()));
        p.setPincode(normalize(req.pincode()));
    }

    private String normalize(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isBlank() ? null : t;
    }

    private PartyResponse toResponse(Party p) {
        return new PartyResponse(
                p.getId(),
                p.getName(),
                p.getPartyType(),
                p.getGstin(),
                p.getPhone(),
                p.getEmail(),
                p.getAddressLine1(),
                p.getAddressLine2(),
                p.getCity(),
                p.getStateCode(),
                p.getPincode(),
                p.isActive()
        );
    }
}

