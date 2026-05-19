package com.wilsonks.gstbilling.context;

/**
 * Holds the current tenant for the duration of a request/thread.
 * Typically set by a Filter/Interceptor (e.g., from JWT claim "tenantId").
 */
public final class TenantContext {

    private TenantContext() {}

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    public static void set(Long tenantId) {CURRENT_TENANT.set(tenantId);}
    public static Long get() {return CURRENT_TENANT.get();}
    public static void clear() {CURRENT_TENANT.remove();}
    public static boolean hasTenant() {
        Long t = CURRENT_TENANT.get();
        return t != null;
    }

}
