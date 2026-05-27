package com.wilsonks.gstbilling.company.party;

public record PartyResponse(
        Long id,
        String name,
        PartyType partyType,
        String gstin,
        String phone,
        String email,
        String addressLine1,
        String addressLine2,
        String city,
        String stateCode,
        String pincode,
        boolean isActive
) {}
