package com.richardjiang880.opensolutions.service;

import com.richardjiang880.opensolutions.dto.*;
import com.richardjiang880.opensolutions.model.Role;
import com.richardjiang880.opensolutions.model.User;
import com.richardjiang880.opensolutions.repository.UserRepository;
import com.richardjiang880.opensolutions.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.Random;

@Service
/**
 * Authentication service handling registration, login, and email verification.
 */
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final MailService mailService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.mailService = mailService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        String verificationCode = generateSixDigitCode();

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .name(request.name())
                .role(Role.STUDENT)
                .verified(false)
                .verificationCode(verificationCode)
                .verificationCodeExpiry(LocalDateTime.now().plusMinutes(15))
                .credits(0)
                .build();

        userRepository.save(user);
        mailService.sendVerificationEmail(request.email(), verificationCode);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getVerified()) {
            throw new IllegalArgumentException("Email already verified");
        }

        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.code())) {
            throw new IllegalArgumentException("Invalid verification code");
        }

        if (user.getVerificationCodeExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification code has expired");
        }

        user.setVerified(true);
        user.setVerificationCode(null);
        user.setVerificationCodeExpiry(null);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
            );
        } catch (BadCredentialsException e) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // Pull the actual User entity so we can generate the JWT
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getVerified()) {
            throw new IllegalArgumentException("Please verify your email first");
        }

        String token = jwtUtils.generateToken(user);

        return new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }

    private String generateSixDigitCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
