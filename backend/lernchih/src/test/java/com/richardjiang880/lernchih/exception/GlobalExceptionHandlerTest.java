package com.richardjiang880.lernchih.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.StaticMessageSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.context.request.ServletWebRequest;

import java.util.Locale;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    private final StaticMessageSource messageSource = new StaticMessageSource();
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler(messageSource);

    @BeforeEach
    void setUp() {
        messageSource.setUseCodeAsDefaultMessage(false);
    }

    private ServletWebRequest webRequest(String uri) {
        jakarta.servlet.http.HttpServletRequest request = mock(jakarta.servlet.http.HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn(uri);
        return new ServletWebRequest(request);
    }

    @Test
    void handleBadRequestReturnsProblemDetail() {
        ResponseEntity<ProblemDetail> response = handler.handleBadRequest(
                new IllegalArgumentException("Invalid input"), webRequest("/api/test"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getTitle()).isEqualTo("Bad Request");
        assertThat(response.getBody().getDetail()).contains("Invalid input");
    }

    @Test
    void handleIllegalStateReturnsInternalServerError() {
        ResponseEntity<ProblemDetail> response = handler.handleIllegalState(
                new IllegalStateException("Something went wrong"), webRequest("/api/test"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getTitle()).isEqualTo("Internal Server Error");
    }

    @Test
    void handleAccessDeniedReturnsForbidden() {
        ResponseEntity<ProblemDetail> response = handler.handleAccessDenied(
                new AccessDeniedException("Denied"), webRequest("/api/admin"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody().getTitle()).isEqualTo("Forbidden");
    }

    @Test
    void handleValidationErrorsIncludesFieldErrors() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "obj");
        bindingResult.addError(new FieldError("obj", "email", "must not be blank"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ProblemDetail> response = handler.handleValidationErrors(ex, webRequest("/api/test"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getProperties()).containsKey("fieldErrors");
    }

    @Test
    void handleConstraintViolationIncludesViolations() {
        @SuppressWarnings("unchecked")
        ConstraintViolation<?> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("email");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must be valid");
        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        ResponseEntity<ProblemDetail> response = handler.handleConstraintViolation(ex, webRequest("/api/test"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody().getProperties()).containsKey("violations");
    }

    @Test
    void handleEntityNotFoundReturnsNotFound() {
        ResponseEntity<ProblemDetail> response = handler.handleEntityNotFound(
                new EntityNotFoundException("Not there"), webRequest("/api/resources/99"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().getTitle()).isEqualTo("Not Found");
    }

    @Test
    void handleGenericExceptionReturnsInternalServerError() {
        ResponseEntity<ProblemDetail> response = handler.handleGenericException(
                new RuntimeException("Unexpected"), webRequest("/api/test"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody().getTitle()).isEqualTo("Internal Server Error");
    }

    @Test
    void requestUriReturnsNullForNonServletWebRequest() {
        org.springframework.web.context.request.WebRequest request = mock(org.springframework.web.context.request.WebRequest.class);

        ResponseEntity<ProblemDetail> response = handler.handleBadRequest(
                new IllegalArgumentException("bad"), request);

        assertThat(response.getBody().getInstance()).isNull();
    }
}
