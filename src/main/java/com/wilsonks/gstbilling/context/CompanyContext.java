package com.wilsonks.gstbilling.context;

public class CompanyContext {

    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();

    public static void set(Long companyId) {
        CURRENT.set(companyId);
    }

    public static Long get() {
        return CURRENT.get();
    }

    public static void clear() {
        CURRENT.remove();
    }
}

