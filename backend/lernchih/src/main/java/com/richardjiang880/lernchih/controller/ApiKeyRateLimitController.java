package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.ApiKeyRateLimit;
import com.richardjiang880.lernchih.service.ApiKeyRateLimitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for API key rate-limit management (F95).
 *
 * Exposes endpoints to configure per-key quotas (requests per
 * minute/hour/day) and inspect current usage. Admin-gated by
 * SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/api-keys")
public class ApiKeyRateLimitController {

    private final ApiKeyRateLimitService rateLimitService;

    public ApiKeyRateLimitController(ApiKeyRateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @GetMapping("/{id}/rate-limit")
    public ResponseEntity<ApiKeyRateLimit> getRateLimit(@PathVariable Long id) {
        return ResponseEntity.ok(rateLimitService.getRateLimit(id).orElse(null));
    }

    @PutMapping("/{id}/rate-limit")
    public ResponseEntity<ApiKeyRateLimit> setRateLimit(
            @PathVariable Long id,
            @RequestBody UpdateRateLimitRequest request) {
        return ResponseEntity.ok(rateLimitService.setRateLimit(
                id, request.requestsPerMinute(), request.requestsPerHour(), request.requestsPerDay()));
    }

    @GetMapping("/rate-limits/usage")
    public ResponseEntity<List<Map<String, Object>>> getAllUsage() {
        return ResponseEntity.ok(rateLimitService.getAllUsage());
    }

    @GetMapping("/{id}/usage")
    public ResponseEntity<Map<String, Long>> getUsage(@PathVariable Long id) {
        return ResponseEntity.ok(rateLimitService.getUsageSnapshot(id));
    }

    public record UpdateRateLimitRequest(Integer requestsPerMinute, Integer requestsPerHour, Integer requestsPerDay) {}
}
