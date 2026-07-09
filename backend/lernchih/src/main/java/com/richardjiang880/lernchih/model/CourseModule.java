package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A single module (lesson) that belongs to a course. Modules are ordered by
 * {@code sortOrder} and tracked for completion via {@link ModuleCompletion}.
 */
@Entity
@Table(name = "course_modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String title;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
