package com.richardjiang880.lernchih;

import com.richardjiang880.lernchih.dto.AuthResponse;
import com.richardjiang880.lernchih.dto.LoginRequest;
import com.richardjiang880.lernchih.dto.RegisterRequest;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Common helpers for controller integration tests that run against the
 * Testcontainers-backed application context started by {@link AbstractIntegrationTest}.
 */
public abstract class AbstractControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    protected TestRestTemplate restTemplate;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected User createVerifiedUser(String email, String name, Role role) {
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode("password"))
                .name(name)
                .role(role)
                .verified(true)
                .credits(0)
                .build();
        return userRepository.save(user);
    }

    protected String obtainAccessToken(String email) {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest(email, "password"),
                AuthResponse.class);
        if (response.getBody() == null || response.getBody().token() == null) {
            throw new IllegalStateException("Failed to obtain access token for " + email);
        }
        return response.getBody().token();
    }

    protected String registerAndVerify(String email, String name, Role role) {
        restTemplate.postForEntity("/api/auth/register", new RegisterRequest(email, "password", name), Void.class);
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setVerified(true);
        userRepository.save(user);
        return obtainAccessToken(email);
    }

    protected HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    protected <T> ResponseEntity<T> exchange(String path, HttpMethod method, HttpEntity<?> entity, Class<T> type) {
        return restTemplate.exchange(path, method, entity, type);
    }
}
