package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.PasswordResetToken;
import com.richardjiang880.lernchih.model.RefreshToken;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.PasswordResetTokenRepository;
import com.richardjiang880.lernchih.repository.RefreshTokenRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
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
import java.time.Instant;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
/**
 * Authentication service handling registration, login, email verification,
 * and JWT refresh-token rotation with reuse detection.
 */
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    // Used for refresh-token generation (32 bytes of entropy) and family ids.
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int REFRESH_TOKEN_BYTES = 32;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final MailService mailService;
    private final TotpService totpService;

    @Value("${app.jwt.refresh-expiration:604800000}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtils jwtUtils,
                       MailService mailService,
                       TotpService totpService) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.mailService = mailService;
        this.totpService = totpService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        // Email format validation is handled by @Email annotation on the DTO
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
                // Verification code expires after 15 minutes
                .verificationCodeExpiry(LocalDateTime.now().plusMinutes(15))
                .credits(0)
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", request.email());
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

    @Transactional
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
        // Issue the first refresh token of a new login chain (new family id)
        String rawRefreshToken = issueRefreshToken(user, newFamilyId());

        return new AuthResponse(
            token,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name(),
            rawRefreshToken
        );
    }

    /**
     * Rotate a refresh token: validates the incoming token, detects reuse of a
     * revoked token (revoking the entire family in that case), and issues a
     * fresh access token + refresh token in the same family.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        String tokenHash = sha256Hex(rawRefreshToken);
        Optional<RefreshToken> tokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);
        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        RefreshToken token = tokenOpt.get();

        // REUSE DETECTION: a revoked token being presented again means it was
        // likely stolen. Revoke every active token in this family so the whole
        // login chain is invalidated.
        if (token.isRevoked()) {
            revokeFamily(token.getFamilyId());
            log.warn("Refresh token reuse detected; family {} revoked", token.getFamilyId());
            throw new IllegalArgumentException("Refresh token reuse detected; all tokens in this family have been revoked");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new IllegalArgumentException("Refresh token has expired");
        }

        // Rotate: revoke the presented token and mint a new one in the same family.
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        User user = token.getUser();
        String newRawRefreshToken = issueRefreshToken(user, token.getFamilyId());
        String accessToken = jwtUtils.generateToken(user);

        return new AuthResponse(
            accessToken,
            user.getId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name(),
            newRawRefreshToken
        );
    }

    /**
     * Revoke a refresh token (and its family) on logout.
     */
    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        String tokenHash = sha256Hex(rawRefreshToken);
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public TotpSetupResponse setupTotp(User user) {
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        userRepository.save(user);

        String qrUri = String.format(
                "otpauth://totp/LernChih:%s?secret=%s&issuer=LernChih",
                user.getEmail(),
                secret
        );
        return new TotpSetupResponse(secret, qrUri);
    }

    @Transactional
    public void verifyTotp(User user, String code) {
        if (user.getTotpSecret() == null) {
            throw new IllegalArgumentException("TOTP not set up");
        }
        if (!totpService.verifyCode(user.getTotpSecret(), code)) {
            throw new IllegalArgumentException("Invalid TOTP code");
        }
        user.setTotpEnabled(true);
        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String rawToken = generateRawRefreshToken();
        String tokenHash = sha256Hex(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
        passwordResetTokenRepository.save(resetToken);

        // TODO: build reset link from app.base-url property
        String resetLink = "https://lernchih.example.com/reset-password?token=" + rawToken;
        mailService.sendNotificationEmail(
                user.getEmail(),
                "LernChih - Password Reset Request",
                "Click the link to reset your password:\n\n" + resetLink + "\n\nThis link expires in 1 hour."
        );
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword) {
        String tokenHash = sha256Hex(rawToken);
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

        if (token.getUsed()) {
            throw new IllegalArgumentException("Reset token already used");
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);
    }

    // ---- Refresh-token helpers -------------------------------------------------

    /**
     * Generate a raw refresh token, persist only its SHA-256 hash, and return
     * the raw token to the caller. The raw token is never stored.
     */
    private String issueRefreshToken(User user, Long familyId) {
        String rawToken = generateRawRefreshToken();
        RefreshToken refresh = RefreshToken.builder()
                .tokenHash(sha256Hex(rawToken))
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .revoked(false)
                .familyId(familyId)
                .build();
        refreshTokenRepository.save(refresh);
        return rawToken;
    }

    private void revokeFamily(Long familyId) {
        List<RefreshToken> active = refreshTokenRepository.findByFamilyIdAndRevokedFalse(familyId);
        for (RefreshToken t : active) {
            t.setRevoked(true);
        }
        refreshTokenRepository.saveAll(active);
    }

    private String generateRawRefreshToken() {
        byte[] bytes = new byte[REFRESH_TOKEN_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private Long newFamilyId() {
        // Mask the sign bit so the family id is always positive.
        return SECURE_RANDOM.nextLong() & Long.MAX_VALUE;
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    private String generateSixDigitCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
