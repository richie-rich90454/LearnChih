package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilsTest {

    private static final String SECRET = "test-jwt-secret-with-at-least-32-characters-long";
    private static final long EXPIRATION_MS = 60_000L;

    private final JwtUtils jwtUtils = new JwtUtils();

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", SECRET);
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", EXPIRATION_MS);
    }

    @Test
    void generateTokenReturnsParsableJwt() {
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.STUDENT)
                .build();

        String token = jwtUtils.generateToken(user);

        assertThat(token).isNotBlank();
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    void extractEmailReturnsSubject() {
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.STUDENT)
                .build();

        String token = jwtUtils.generateToken(user);

        assertThat(jwtUtils.extractEmail(token)).isEqualTo("alice@example.com");
    }

    @Test
    void extractRoleReturnsRoleClaim() {
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.MODERATOR)
                .build();

        String token = jwtUtils.generateToken(user);

        assertThat(jwtUtils.extractRole(token)).isEqualTo("MODERATOR");
    }

    @Test
    void isTokenValidReturnsTrueForMatchingUserDetails() {
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.STUDENT)
                .build();
        String token = jwtUtils.generateToken(user);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("alice@example.com")
                .password("password")
                .roles("STUDENT")
                .build();

        assertThat(jwtUtils.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    void isTokenValidReturnsFalseForMismatchedUserDetails() {
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.STUDENT)
                .build();
        String token = jwtUtils.generateToken(user);
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername("bob@example.com")
                .password("password")
                .roles("STUDENT")
                .build();

        assertThat(jwtUtils.isTokenValid(token, userDetails)).isFalse();
    }

    @Test
    void expiredTokenThrowsExpiredJwtException() {
        ReflectionTestUtils.setField(jwtUtils, "jwtExpiration", -10_000L);
        User user = User.builder()
                .email("alice@example.com")
                .role(Role.STUDENT)
                .build();
        String token = jwtUtils.generateToken(user);

        assertThatThrownBy(() -> jwtUtils.extractEmail(token))
                .isInstanceOf(ExpiredJwtException.class);
    }
}
