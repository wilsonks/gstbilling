package com.wilsonks.gstbilling.exception;


import java.time.Instant;

public record ExceptionResponse(
        Instant timestamp,
        int status,
        String statusText,
        String message,
        String path
) {
}
