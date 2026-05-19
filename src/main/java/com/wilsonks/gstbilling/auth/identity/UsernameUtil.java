package com.wilsonks.gstbilling.auth.identity;

import java.util.Locale;

public final class UsernameUtil {
    private UsernameUtil() {}

    public static String generateUsernameFromEmail(String email) {
        if (email == null) return null;
        String e = email.trim().toLowerCase(Locale.ROOT);
        int at = e.indexOf('@');
        return (at > 0 ? e.substring(0, at) : e).replaceAll("[^a-z0-9._-]", "");
    }
}

