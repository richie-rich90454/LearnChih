package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ApiKeyDtos;
import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ApiKeyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin API key management (F94).
 *
 * Exposes CRUD over API keys with scoped permissions (read, write, admin).
 * The raw key plaintext is returned exactly once, at creation time.
 * Admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/api-keys")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final UserRepository userRepository;

    public ApiKeyController(ApiKeyService apiKeyService, UserRepository userRepository) {
        this.apiKeyService = apiKeyService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ApiKeyDtos.ApiKeyResponse>> listKeys(
            @RequestParam(name = "userId", required = false) Long userId) {
        List<ApiKey> keys = (userId != null)
                ? apiKeyService.listApiKeysForUserAdmin(userId)
                : apiKeyService.listAllApiKeys();
        return ResponseEntity.ok(keys.stream().map(apiKeyService::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<ApiKeyDtos.CreatedApiKey> createKey(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ApiKeyDtos.CreateApiKeyRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        User currentUser = getUserFromDetails(userDetails);
        String plaintext = apiKeyService.generateApiKey(
                currentUser.getId(), request.name().trim(), request.scopes());
        ApiKey created = apiKeyService.listApiKeysForUserAdmin(currentUser.getId()).stream()
                .filter(k -> request.name().trim().equals(k.getName()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Created API key not found"));
        return ResponseEntity.ok(new ApiKeyDtos.CreatedApiKey(
                apiKeyService.toResponse(created), plaintext));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> revokeKey(@PathVariable Long id) {
        apiKeyService.revokeApiKeyAdmin(id);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}