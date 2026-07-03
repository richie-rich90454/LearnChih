package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.PasswordResetTokenRepository;
import com.richardjiang880.lernchih.repository.RefreshTokenRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private RefreshTokenRepository refreshTokenRepository;
    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private MailService mailService;
    @Mock
    private TotpService totpService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, refreshTokenRepository, passwordResetTokenRepository,
                passwordEncoder, authenticationManager, jwtUtils, mailService, totpService);
        ReflectionTestUtils.setField(authService, "refreshExpirationMs", 604800000L);
    }

    @Test
    void registerSavesNewUserAndSendsVerificationEmail() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.register(new RegisterRequest("alice@example.com", "password", "Alice"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User saved = userCaptor.getValue();
        assertThat(saved.getEmail()).isEqualTo("alice@example.com");
        assertThat(saved.getPassword()).isEqualTo("encoded");
        assertThat(saved.getName()).isEqualTo("Alice");
        assertThat(saved.getRole()).isEqualTo(Role.STUDENT);
        assertThat(saved.getVerified()).isFalse();
        assertThat(saved.getVerificationCode()).hasSize(6);
        assertThat(saved.getCredits()).isZero();
        verify(mailService).sendVerificationEmail(eq("alice@example.com"), anyString());
    }

    @Test
    void registerThrowsWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(new RegisterRequest("alice@example.com", "password", "Alice")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already registered");
    }

    @Test
    void verifyEmailActivatesUserWithCorrectCode() {
        User user = User.builder()
                .email("alice@example.com")
                .verified(false)
                .verificationCode("123456")
                .verificationCodeExpiry(LocalDateTime.now().plusMinutes(5))
                .build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.verifyEmail(new VerifyEmailRequest("alice@example.com", "123456"));

        assertThat(user.getVerified()).isTrue();
        assertThat(user.getVerificationCode()).isNull();
        assertThat(user.getVerificationCodeExpiry()).isNull();
    }

    @Test
    void verifyEmailThrowsWhenAlreadyVerified() {
        User user = User.builder().email("alice@example.com").verified(true).build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyEmail(new VerifyEmailRequest("alice@example.com", "123456")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already verified");
    }

    @Test
    void verifyEmailThrowsWhenCodeExpired() {
        User user = User.builder()
                .email("alice@example.com")
                .verified(false)
                .verificationCode("123456")
                .verificationCodeExpiry(LocalDateTime.now().minusMinutes(1))
                .build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.verifyEmail(new VerifyEmailRequest("alice@example.com", "123456")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void loginReturnsAuthResponseForVerifiedUser() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .name("Alice")
                .role(Role.STUDENT)
                .verified(true)
                .build();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(jwtUtils.generateToken(user)).thenReturn("access-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            RefreshToken t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        AuthResponse response = authService.login(new LoginRequest("alice@example.com", "password"));

        assertThat(response.token()).isEqualTo("access-token");
        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.name()).isEqualTo("Alice");
        assertThat(response.role()).isEqualTo("STUDENT");
        assertThat(response.refreshToken()).isNotBlank();
    }

    @Test
    void loginThrowsForBadCredentials() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("alice@example.com", "password")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void loginThrowsForUnverifiedUser() {
        User user = User.builder().email("alice@example.com").verified(false).build();
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(mock(org.springframework.security.core.Authentication.class));
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> authService.login(new LoginRequest("alice@example.com", "password")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("verify your email");
    }

    @Test
    void refreshRotatesValidToken() {
        User user = User.builder().id(1L).email("alice@example.com").name("Alice").role(Role.STUDENT).build();
        RefreshToken token = RefreshToken.builder()
                .tokenHash(sha256("raw-token"))
                .user(user)
                .expiresAt(Instant.now().plusMillis(100000))
                .revoked(false)
                .familyId(123L)
                .build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtUtils.generateToken(user)).thenReturn("new-access-token");

        AuthResponse response = authService.refresh("raw-token");

        assertThat(response.token()).isEqualTo("new-access-token");
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(token.isRevoked()).isTrue();
    }

    @Test
    void refreshDetectsReuseOfRevokedToken() {
        User user = User.builder().id(1L).build();
        RefreshToken token = RefreshToken.builder()
                .tokenHash(sha256("raw-token"))
                .user(user)
                .expiresAt(Instant.now().plusMillis(100000))
                .revoked(true)
                .familyId(123L)
                .build();
        RefreshToken active = RefreshToken.builder()
                .tokenHash("other")
                .user(user)
                .revoked(false)
                .familyId(123L)
                .build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(refreshTokenRepository.findByFamilyIdAndRevokedFalse(123L)).thenReturn(java.util.List.of(active));
        when(refreshTokenRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> authService.refresh("raw-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reuse detected");
        assertThat(active.isRevoked()).isTrue();
    }

    @Test
    void refreshThrowsForExpiredToken() {
        User user = User.builder().id(1L).build();
        RefreshToken token = RefreshToken.builder()
                .tokenHash(sha256("raw-token"))
                .user(user)
                .expiresAt(Instant.now().minusMillis(1000))
                .revoked(false)
                .familyId(123L)
                .build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThatThrownBy(() -> authService.refresh("raw-token"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
        assertThat(token.isRevoked()).isTrue();
    }

    @Test
    void refreshThrowsForBlankToken() {
        assertThatThrownBy(() -> authService.refresh("  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("required");
    }

    @Test
    void logoutRevokesToken() {
        RefreshToken token = RefreshToken.builder()
                .tokenHash(sha256("raw-token"))
                .revoked(false)
                .build();
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.logout("raw-token");

        assertThat(token.isRevoked()).isTrue();
    }

    @Test
    void setupTotpSavesSecretAndReturnsQrUri() {
        User user = User.builder().id(1L).email("alice@example.com").build();
        when(totpService.generateSecret()).thenReturn("secret123");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        TotpSetupResponse response = authService.setupTotp(user);

        assertThat(response.secret()).isEqualTo("secret123");
        assertThat(response.qrUri()).contains("alice@example.com").contains("secret123");
        assertThat(user.getTotpSecret()).isEqualTo("secret123");
    }

    @Test
    void verifyTotpEnablesTotpForValidCode() {
        User user = User.builder().id(1L).totpSecret("secret123").totpEnabled(false).build();
        when(totpService.verifyCode("secret123", "123456")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.verifyTotp(user, "123456");

        assertThat(user.getTotpEnabled()).isTrue();
    }

    @Test
    void verifyTotpThrowsWhenNotSetUp() {
        User user = User.builder().id(1L).totpSecret(null).build();

        assertThatThrownBy(() -> authService.verifyTotp(user, "123456"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not set up");
    }

    @Test
    void requestPasswordResetCreatesTokenAndSendsEmail() {
        User user = User.builder().id(1L).email("alice@example.com").build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.requestPasswordReset("alice@example.com");

        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(passwordResetTokenRepository).save(captor.capture());
        assertThat(captor.getValue().getUser()).isEqualTo(user);
        assertThat(captor.getValue().getTokenHash()).isNotBlank();
        verify(mailService).sendNotificationEmail(eq("alice@example.com"), anyString(), anyString());
    }

    @Test
    void resetPasswordUpdatesPasswordAndMarksTokenUsed() {
        User user = User.builder().id(1L).password("old").build();
        PasswordResetToken token = PasswordResetToken.builder()
                .tokenHash(sha256("raw-token"))
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newpass")).thenReturn("encoded-new");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(passwordResetTokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.resetPassword("raw-token", "newpass");

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        assertThat(token.getUsed()).isTrue();
    }

    @Test
    void resetPasswordThrowsForAlreadyUsedToken() {
        PasswordResetToken token = PasswordResetToken.builder()
                .tokenHash(sha256("raw-token"))
                .used(true)
                .build();
        when(passwordResetTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        assertThatThrownBy(() -> authService.resetPassword("raw-token", "newpass"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already used");
    }

    private String sha256(String input) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
