package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.SystemSetting;
import com.richardjiang880.lernchih.service.SystemSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for platform system settings.
 *
 * Exposes a public read endpoint (any authenticated user can read a single
 * setting by key — needed so the maintenance banner shows to all logged-in
 * users) and admin endpoints for listing and updating settings.
 *
 * Security:
 *   - GET  /api/system-settings/{key}          → authenticated (any user)
 *   - GET  /api/admin/system-settings          → admin (SecurityConfig /api/admin/**)
 *   - PUT  /api/admin/system-settings/{key}    → admin
 */
@RestController
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    public SystemSettingController(SystemSettingService systemSettingService) {
        this.systemSettingService = systemSettingService;
    }

    /**
     * Read a single setting by key. Available to any authenticated user so
     * the maintenance banner can render for all logged-in users.
     */
    @GetMapping("/api/system-settings/{key}")
    public ResponseEntity<SystemSetting> getSetting(@PathVariable String key) {
        return systemSettingService.findByKey(key)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * List all settings. Admin-gated by SecurityConfig ("/api/admin/**").
     */
    @GetMapping("/api/admin/system-settings")
    public ResponseEntity<List<SystemSetting>> listSettings() {
        return ResponseEntity.ok(systemSettingService.findAll());
    }

    /**
     * Update a setting's value. Admin-gated. Creates the setting if it
     * does not yet exist.
     */
    @PutMapping("/api/admin/system-settings/{key}")
    public ResponseEntity<SystemSetting> updateSetting(
            @PathVariable String key,
            @RequestBody UpdateSettingRequest request) {
        if (request.value() == null) {
            throw new IllegalArgumentException("value is required");
        }
        return ResponseEntity.ok(systemSettingService.setValue(key, request.value()));
    }

    public record UpdateSettingRequest(String value) {}
}
