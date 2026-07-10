package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.FeatureFlag;
import com.richardjiang880.lernchih.service.FeatureFlagService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin feature flag management.
 *
 * Exposes a list endpoint and an update endpoint to toggle individual
 * flags. Admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/feature-flags")
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @GetMapping
    public ResponseEntity<List<FeatureFlag>> listFlags() {
        return ResponseEntity.ok(featureFlagService.findAll());
    }

    @PutMapping("/{key}")
    public ResponseEntity<FeatureFlag> updateFlag(
            @PathVariable String key,
            @RequestBody UpdateFlagRequest request) {
        if (request.enabled() == null) {
            throw new IllegalArgumentException("enabled is required");
        }
        return ResponseEntity.ok(featureFlagService.setEnabled(key, request.enabled()));
    }

    public record UpdateFlagRequest(Boolean enabled) {}
}
