package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.UserProfileResponse;
import com.richardjiang880.lernchih.model.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end JWT authentication and authorization tests.
 *
 * <p>Verifies that protected endpoints reject unauthenticated requests and
 * accept valid tokens with the correct role.
 */
class JwtSecurityIT extends AbstractControllerIntegrationTest {

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    @Test
    void protectedEndpointRejectsAnonymousRequests() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/users/me", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void protectedEndpointAcceptsValidStudentToken() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        ResponseEntity<UserProfileResponse> response = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                UserProfileResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().email()).isEqualTo("alice@example.com");
    }

    @Test
    void adminEndpointRejectsStudentRole() {
        String studentToken = registerAndVerify("student@example.com", "Student", Role.STUDENT);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/admin/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(studentToken)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void adminEndpointAcceptsModeratorRole() {
        String moderatorToken = registerAndVerify("mod@example.com", "Moderator", Role.MODERATOR);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/admin/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(moderatorToken)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void adminEndpointAcceptsAdminRole() {
        String adminToken = registerAndVerify("admin@example.com", "Admin", Role.ADMIN);

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/admin/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(adminToken)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void invalidTokenIsRejected() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth("invalid-token");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}
