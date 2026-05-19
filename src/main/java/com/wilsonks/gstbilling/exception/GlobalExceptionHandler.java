package com.wilsonks.gstbilling.exception;

import jakarta.security.auth.message.AuthException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ExceptionResponse> handleAuth(AuthException ex,
                                                        HttpServletRequest request) {
        return build(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ExceptionResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                                   HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ExceptionResponse> handleNotFound(NotFoundException ex,
                                                            HttpServletRequest request) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ExceptionResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex,
                                                                          HttpServletRequest request) {
        String message = "Database constraint violation";

        Throwable root = getRootCause(ex);
        String rootMessage = root != null ? root.getMessage() : ex.getMessage();

        if (rootMessage != null) {
            String lower = rootMessage.toLowerCase();

            if (lower.contains("tenants") && lower.contains("gstin")) {
                message = "Tenant with the same GSTIN already exists";
            } else if (lower.contains("companies") && lower.contains("gstin")) {
                message = "Company with the same GSTIN already exists";
            } else if (lower.contains("unique") || lower.contains("duplicate")) {
                message = "A record with the same value already exists";
            } else if (lower.contains("foreign key")) {
                message = "Operation failed because a related record does not exist";
            } else if (lower.contains("null")) {
                message = "A required field is missing";
            }
        }

        return build(HttpStatus.CONFLICT, message, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponse> handleAny(Exception ex,
                                                       HttpServletRequest request) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", request);
    }

    private ResponseEntity<ExceptionResponse> build(HttpStatus status,
                                                    String message,
                                                    HttpServletRequest request) {
        ExceptionResponse body = new ExceptionResponse(
                Instant.now(),
                status.value(),
                status.getReasonPhrase(),
                message,
                request.getRequestURI()
        );
        return ResponseEntity.status(status).body(body);
    }

    private Throwable getRootCause(Throwable ex) {
        Throwable result = ex;
        while (result.getCause() != null && result.getCause() != result) {
            result = result.getCause();
        }
        return result;
    }
}