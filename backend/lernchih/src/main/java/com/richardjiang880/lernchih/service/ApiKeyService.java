package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ApiKeyDtos;
import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.repository.ApiKeyRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Base64;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ApiKeyService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int API_KEY_BYTES = 32;
    private static final Set<String> ALLOWED_SCOPES = Set.of("read", "write", "admin");

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyService(ApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Transactional
    public String generateApiKey(Long userId, String name) {
        return generateApiKey(userId, name, List.of("read"));
    }

    @Transactional
    public String generateApiKey(Long userId, String name, List<String> scopes) {
        List<String> normalized = normalizeScopes(scopes);
        String rawKey = generateRawKey();
        ApiKey apiKey = ApiKey.builder()
                .userId(userId)
                .keyHash(sha256Hex(rawKey))
                .name(name)
                .scopes(joinScopes(normalized))
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
        revoke(apiKey);
        apiKeyRepository.save(apiKey);
    }

    @Transactional
    public void revokeApiKeyAdmin(Long keyId) {
        ApiKey apiKey = apiKeyRepository.findById(keyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));
        revoke(apiKey);
        apiKeyRepository.save(apiKey);
    }

    private void revoke(ApiKey apiKey) {
        apiKey.setRevoked(true);
        apiKey.setRevokedAt(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<ApiKey> listApiKeys(Long userId) {
        return apiKeyRepository.findByUserIdAndRevokedFalse(userId);
    }

    @Transactional(readOnly = true)
    public List<ApiKey> listApiKeysForUserAdmin(Long userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<ApiKey> listAllApiKeys() {
        return apiKeyRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional(readOnly = true)
    public boolean hasScope(String rawKey, String requiredScope) {
        if (rawKey == null || rawKey.isBlank()) {
            return false;
        }
        return apiKeyRepository.findByKeyHash(sha256Hex(rawKey))
                .filter(key -> !key.getRevoked())
                .map(ApiKey::getScopes)
                .map(scopesStr -> parseScopes(scopesStr).contains(requiredScope))
                .orElse(false);
    }

    public ApiKeyDtos.ApiKeyResponse toResponse(ApiKey apiKey) {
        return new ApiKeyDtos.ApiKeyResponse(
                apiKey.getId(),
                apiKey.getUserId(),
                apiKey.getName(),
                prefixOf(apiKey.getKeyHash()),
                parseScopes(apiKey.getScopes()),
                apiKey.getRevoked(),
                apiKey.getCreatedAt(),
                apiKey.getRevokedAt(),
                apiKey.getLastUsedAt());
    }

    private String prefixOf(String keyHash) {
        if (keyHash == null || keyHash.length() < 8) return "lk_****";
        return "lk_" + keyHash.substring(0, 6) + "****";
    }

    private List<String> normalizeScopes(List<String> scopes) {
        if (scopes == null || scopes.isEmpty()) {
            return List.of("read");
        }
        LinkedHashSet<String> normalized = scopes.stream()
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(ALLOWED_SCOPES::contains)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (normalized.isEmpty()) {
            normalized.add("read");
        }
        return List.copyOf(normalized);
    }

    private String joinScopes(List<String> scopes) {
        return String.join(",", scopes);
    }

    private List<String> parseScopes(String scopesStr) {
        if (scopesStr == null || scopesStr.isBlank()) {
            return List.of();
        }
        return Arrays.stream(scopesStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
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
