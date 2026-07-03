package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

class AuthControllerIT extends AbstractControllerIntegrationTest {

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerCreatesUnverifiedUser() {
        ResponseEntity<Void> response = restTemplate.postForEntity(
                "/api/auth/register",
                new RegisterRequest("alice@example.com", "password", "Alice"),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        User user = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertThat(user.getVerified()).isFalse();
        assertThat(user.getRole()).isEqualTo(Role.STUDENT);
    }

    @Test
    void loginReturnsTokensForVerifiedUser() {
        registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("alice@example.com", "password"),
                AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().token()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().email()).isEqualTo("alice@example.com");
    }

    @Test
    void loginRejectsUnverifiedUser() {
        restTemplate.postForEntity(
                "/api/auth/register",
                new RegisterRequest("bob@example.com", "password", "Bob"),
                Void.class);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("bob@example.com", "password"),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("verify your email");
    }

    @Test
    void refreshRotatesToken() {
        registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        AuthResponse login = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("alice@example.com", "password"),
                AuthResponse.class).getBody();

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/refresh",
                new RefreshRequest(login.refreshToken()),
                AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().token()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotEqualTo(login.refreshToken());
    }

    @Test
    void logoutAcceptsRefreshToken() {
        registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        AuthResponse login = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("alice@example.com", "password"),
                AuthResponse.class).getBody();

        ResponseEntity<Void> response = restTemplate.postForEntity(
                "/api/auth/logout",
                new RefreshRequest(login.refreshToken()),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void refreshTokenReuseIsDetected() {
        registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        AuthResponse first = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("alice@example.com", "password"),
                AuthResponse.class).getBody();

        AuthResponse rotated = restTemplate.postForEntity(
                "/api/auth/refresh",
                new RefreshRequest(first.refreshToken()),
                AuthResponse.class).getBody();

        ResponseEntity<String> reuse = restTemplate.postForEntity(
                "/api/auth/refresh",
                new RefreshRequest(first.refreshToken()),
                String.class);

        assertThat(reuse.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(reuse.getBody()).contains("reuse detected");

        ResponseEntity<String> familyRevoked = restTemplate.postForEntity(
                "/api/auth/refresh",
                new RefreshRequest(rotated.refreshToken()),
                String.class);
        assertThat(familyRevoked.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void verifyEmailActivatesAccount() {
        restTemplate.postForEntity(
                "/api/auth/register",
                new RegisterRequest("charlie@example.com", "password", "Charlie"),
                Void.class);
        User user = userRepository.findByEmail("charlie@example.com").orElseThrow();
        String code = user.getVerificationCode();

        ResponseEntity<Void> response = restTemplate.postForEntity(
                "/api/auth/verify",
                new VerifyEmailRequest("charlie@example.com", code),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        User updated = userRepository.findByEmail("charlie@example.com").orElseThrow();
        assertThat(updated.getVerified()).isTrue();
    }
}
