package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.AuditLog;
import com.richardjiang880.lernchih.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service for recording and querying audit log entries.
 *
 * Other controllers and services call {@link #log} to persist an audit
 * record whenever a privileged action is performed (e.g. role change,
 * user suspension, feature flag toggle). The admin audit-log viewer
 * calls {@link #findAll} / {@link #findByAction} to render the history.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog log(Long actorId, String action, String targetType,
                        Long targetId, String detailsJson, String ipAddress) {
        AuditLog entry = AuditLog.builder()
                .actorId(actorId)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .detailsJson(detailsJson)
                .ipAddress(ipAddress)
                .build();
        return auditLogRepository.save(entry);
    }

    public Page<AuditLog> findAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public Page<AuditLog> findByAction(String action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }
}
