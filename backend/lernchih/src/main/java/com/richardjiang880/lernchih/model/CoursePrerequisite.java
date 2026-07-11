package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A directed prerequisite edge between two courses (F19). A row states that
 * {@code courseId} requires {@code prerequisiteCourseId} to be fully
 * completed (all modules) before it is unlocked for a user. Backed by the
 * {@code course_prerequisites} table created in Flyway migration
 * V20260709010004. The graph must remain acyclic; cycle detection is
 * enforced in {@code CoursePrerequisiteService}.
 */
@Entity
@Table(name = "course_prerequisites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoursePrerequisite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "course_id", nullable = false)
    private Long courseId;

    @Column(name = "prerequisite_course_id", nullable = false)
    private Long prerequisiteCourseId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
