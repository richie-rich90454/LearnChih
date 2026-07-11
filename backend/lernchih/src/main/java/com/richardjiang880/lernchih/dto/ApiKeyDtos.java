package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for the admin API key management endpoints (F94).
 */
public final class ApiKeyDtos {

    private ApiKeyDtos() {}

    /** Request body for creating a new API key with scoped permissions. */
    public record CreateApiKeyRequest(String name, List<String> scopes) {}

    /** Public representation of an API key. Never exposes the raw key value. */
    public record ApiKeyResponse(
            Long id,
            Long userId,
            String name,
            String prefix,
            List<String> scopes,
            Boolean revoked,
            LocalDateTime createdAt,
            LocalDateTime revokedAt,
            LocalDateTime lastUsedAt) {}

    /** Returned once immediately after creation so the admin can copy it. */
    public record CreatedApiKey(ApiKeyResponse key, String plaintext) {}
}