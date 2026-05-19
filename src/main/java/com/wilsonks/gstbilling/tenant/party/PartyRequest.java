package com.wilsonks.gstbilling.tenant.party;

public record PartyRequest(
        String name,
        PartyType partyType,
        String gstin,
        String phone,
        String email,
        String addressLine1,
        String addressLine2,
        String city,
        String stateCode,
        String pincode
) {}

