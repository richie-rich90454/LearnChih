package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A lightweight user-to-resource interaction (F23). Recording the subject and
 * category at interaction time lets the {@code RecommendationService} build a
 * content-based affinity profile without re-joining the resource table on
 * every recommendation request.
 *
 * <p>Backed by the {@code resource_interactions} table created in Flyway
 * migration V20260709020001.
 */
@Entity
@Table(name = "resource_interactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceInteraction {

    public enum Interaction {
        VIEW,
        UPVOTE
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Interaction interaction;

    @Column(name = "subject_id")
    private Long subjectId;

    @Column(length = 40)
    private String category;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
