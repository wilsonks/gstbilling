package com.wilsonks.gstbilling.auth.identity;

public enum UserScope {
    PLATFORM, // Can access all tenants
    TENANT    // Can access only their own tenant
}
