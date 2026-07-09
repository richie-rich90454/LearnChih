package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Records that a user has completed a specific {@link CourseModule}.
 * One row per (userId, moduleId).
 */
@Entity
@Table(
        name = "module_completions",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "module_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "module_id", nullable = false)
    private Long moduleId;

    @Column(name = "completed_at", nullable = false)
    private LocalDateTime completedAt;

    /** Optional assessment score for the module, if the source material provides one. */
    @Column(name = "score")
    private Integer score;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }
}
