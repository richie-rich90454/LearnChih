package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * JPA entity mapping to the {@code mod_queue} table (created in V12).
 *
 * Represents a single item in the admin moderation queue. Each item captures
 * a piece of reported content (type + id), the reporter, a reason, and the
 * current review status. SLA tracking is provided by {@link #slaDeadline}
 * (set to 24 hours after creation by default) and {@link #assignedTo} /
 * {@link #resolvedAt} for assignment and resolution audit.
 */
@Entity
@Table(name = "mod_queue")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModerationItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "content_id", nullable = false)
    private Long contentId;

    @Column(name = "reported_by")
    private Long reportedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "sla_deadline")
    private LocalDateTime slaDeadline;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (status == null) {
            status = ReportStatus.PENDING;
        }
        if (slaDeadline == null) {
            slaDeadline = createdAt.plusHours(24);
        }
    }
}
