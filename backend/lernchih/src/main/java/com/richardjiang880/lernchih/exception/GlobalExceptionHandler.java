package com.richardjiang880.lernchih.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.context.request.ServletWebRequest;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
/**
 * Global exception handler returning RFC 7807 Problem Detail
 * (application/problem+json) responses.
 */
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // Business logic errors return 400 Bad Request
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ProblemDetail> handleBadRequest(IllegalArgumentException ex, WebRequest request) {
        return problem(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage(), request);
    }

    // Internal state errors return 500 Internal Server Error
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ProblemDetail> handleIllegalState(IllegalStateException ex, WebRequest request) {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", ex.getMessage(), request);
    }

    // Return 403 for Spring Security access denied exceptions
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(AccessDeniedException ex, WebRequest request) {
        return problem(HttpStatus.FORBIDDEN, "Forbidden", "Access denied", request);
    }

    // Handle @Valid body validation errors with field-level detail (400)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidationErrors(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Validation failed");
        pd.setTitle("Validation Failed");
        pd.setInstance(requestUri(request));
        pd.setProperty("fieldErrors", fieldErrors);
        return build(pd, HttpStatus.BAD_REQUEST);
    }

    // Handle @Validated path/query constraint violations (400)
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ProblemDetail> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        Map<String, String> violations = new HashMap<>();
        ex.getConstraintViolations().forEach(v ->
                violations.put(v.getPropertyPath().toString(), v.getMessage()));

        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "Constraint violation");
        pd.setTitle("Validation Failed");
        pd.setInstance(requestUri(request));
        pd.setProperty("violations", violations);
        return build(pd, HttpStatus.BAD_REQUEST);
    }

    // Entity not found returns 404
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleEntityNotFound(EntityNotFoundException ex, WebRequest request) {
        return problem(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex, WebRequest request) {
        log.error("Unexpected error occurred", ex);
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", "An unexpected error occurred", request);
    }

    // Build a RFC 7807 ProblemDetail response with application/problem+json content type
    private ResponseEntity<ProblemDetail> problem(HttpStatus status, String title, String detail, WebRequest request) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(status, detail != null ? detail : title);
        pd.setTitle(title);
        pd.setInstance(requestUri(request));
        return build(pd, status);
    }

    private ResponseEntity<ProblemDetail> build(ProblemDetail pd, HttpStatus status) {
        return ResponseEntity.status(status)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(pd);
    }

    // Resolve the request URI for the ProblemDetail "instance" field
    private URI requestUri(WebRequest request) {
        try {
            if (request instanceof ServletWebRequest swr) {
                HttpServletRequest req = swr.getRequest();
                if (req != null) {
                    return URI.create(req.getRequestURI());
                }
            }
        } catch (Exception ignored) {
            // instance is optional; ignore resolution failures
        }
        return null;
    }
}
