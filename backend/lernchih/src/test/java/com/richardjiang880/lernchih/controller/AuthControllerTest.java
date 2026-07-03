package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    private AuthController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new AuthController(authService, userRepository);
        user = User.builder()
                .email("alice@example.com")
                .password("password")
                .name("Alice")
                .role(Role.STUDENT)
                .build();
        user.setId(1L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void registerDelegatesToService() {
        RegisterRequest request = new RegisterRequest("alice@example.com", "password", "Alice");
        assertThat(controller.register(request).getStatusCode().value()).isEqualTo(200);
        verify(authService).register(request);
    }

    @Test
    void verifyEmailDelegatesToService() {
        VerifyEmailRequest request = new VerifyEmailRequest("alice@example.com", "123456");
        assertThat(controller.verifyEmail(request).getStatusCode().value()).isEqualTo(200);
        verify(authService).verifyEmail(request);
    }

    @Test
    void loginReturnsAuthResponse() {
        LoginRequest request = new LoginRequest("alice@example.com", "password");
        AuthResponse response = new AuthResponse("token", 1L, "alice@example.com", "Alice", "STUDENT", "refresh");
        when(authService.login(request)).thenReturn(response);

        ResponseEntity<AuthResponse> result = controller.login(request);

        assertThat(result.getBody()).isEqualTo(response);
        assertThat(result.getStatusCode().value()).isEqualTo(200);
    }

    @Test
    void refreshReturnsAuthResponse() {
        RefreshRequest request = new RefreshRequest("refresh-token");
        AuthResponse response = new AuthResponse("token", 1L, "alice@example.com", "Alice", "STUDENT", "new-refresh");
        when(authService.refresh("refresh-token")).thenReturn(response);

        ResponseEntity<AuthResponse> result = controller.refresh(request);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void logoutWithTokenDelegatesToService() {
        RefreshRequest request = new RefreshRequest("refresh-token");
        assertThat(controller.logout(request).getStatusCode().value()).isEqualTo(200);
        verify(authService).logout("refresh-token");
    }

    @Test
    void logoutWithoutTokenDoesNothing() {
        assertThat(controller.logout(null).getStatusCode().value()).isEqualTo(200);
        verifyNoInteractions(authService);
    }

    @Test
    void setupTotpReturnsSetupResponse() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        TotpSetupResponse response = new TotpSetupResponse("secret", "qr");
        when(authService.setupTotp(user)).thenReturn(response);

        ResponseEntity<TotpSetupResponse> result = controller.setupTotp(userDetails());

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void verifyTotpDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        TotpVerifyRequest request = new TotpVerifyRequest("123456");

        assertThat(controller.verifyTotp(userDetails(), request).getStatusCode().value()).isEqualTo(200);
        verify(authService).verifyTotp(user, "123456");
    }

    @Test
    void requestPasswordResetDelegatesToService() {
        PasswordResetRequest request = new PasswordResetRequest("alice@example.com");
        assertThat(controller.requestPasswordReset(request).getStatusCode().value()).isEqualTo(200);
        verify(authService).requestPasswordReset("alice@example.com");
    }

    @Test
    void resetPasswordDelegatesToService() {
        PasswordResetConfirmRequest request = new PasswordResetConfirmRequest("token", "newPassword");
        assertThat(controller.resetPassword(request).getStatusCode().value()).isEqualTo(200);
        verify(authService).resetPassword("token", "newPassword");
    }
}
