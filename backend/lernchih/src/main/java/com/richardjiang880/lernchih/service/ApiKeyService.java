package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.repository.ApiKeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
public class ApiKeyService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int API_KEY_BYTES = 32;

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Transactional
    public String generateApiKey(Long userId, String name) {
        String rawKey = generateRawKey();
        ApiKey apiKey = ApiKey.builder()
                .userId(userId)
                .keyHash(sha256Hex(rawKey))
                .name(name)
                .revoked(false)
                .build();
        apiKeyRepository.save(apiKey);
        return rawKey;
    }

    @Transactional(readOnly = true)
    public Optional<Long> verifyApiKey(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) {
            return Optional.empty();
        }
        return apiKeyRepository.findByKeyHash(sha256Hex(rawKey))
                .filter(key -> !key.getRevoked())
                .map(ApiKey::getUserId);
    }

    @Transactional
    public void recordUsage(String rawKey) {
        apiKeyRepository.findByKeyHash(sha256Hex(rawKey))
                .filter(key -> !key.getRevoked())
                .ifPresent(key -> {
                    key.setLastUsedAt(LocalDateTime.now());
                    apiKeyRepository.save(key);
                });
    }

    @Transactional
    public void revokeApiKey(Long keyId, Long userId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));
        if (!apiKey.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You can only revoke your own API keys");
        }
        apiKey.setRevoked(true);
        apiKeyRepository.save(apiKey);
    }

    @Transactional(readOnly = true)
    public List<ApiKey> listApiKeys(Long userId) {
        return apiKeyRepository.findByUserIdAndRevokedFalse(userId);
    }

    private String generateRawKey() {
        byte[] bytes = new byte[API_KEY_BYTES];
        SECURE_RANDOM.nextBytes(bytes);
        return "lk_" + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
