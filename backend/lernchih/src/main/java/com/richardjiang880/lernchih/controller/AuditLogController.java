package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.AuditLog;
import com.richardjiang880.lernchih.service.AuditLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for the admin audit log viewer.
 *
 * Exposes a paginated, optionally action-filtered list of {@link AuditLog}
 * entries. Read-only — audit entries are created internally by
 * {@link AuditLogService#log}. Admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/audit-log")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<Page<AuditLog>> listLogs(
            @RequestParam(name = "action", required = false) String action,
            @PageableDefault(size = 50) Pageable pageable) {
        Page<AuditLog> page;
        if (action != null && !action.isBlank()) {
            page = auditLogService.findByAction(action.trim(), pageable);
        } else {
            page = auditLogService.findAll(pageable);
        }
        return ResponseEntity.ok(page);
    }
}
