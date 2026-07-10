package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Cohort-based study group (F40). A cohort is a time-bounded study group
 * focused on a subject with an optional membership cap. The creator becomes
 * the cohort leader (recorded in {@code cohort_members}).
 */
@Entity
@Table(name = "cohorts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cohort {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /** Optional link to a subject. Nullable for cross-subject cohorts. */
    @Column(name = "subject_id")
    private Long subjectId;

    /** Cohort window start. Nullable for open-ended cohorts. */
    @Column(name = "start_date")
    private LocalDate startDate;

    /** Cohort window end. Nullable. */
    @Column(name = "end_date")
    private LocalDate endDate;

    /** Membership cap. Nullable = unlimited. */
    @Column(name = "max_members")
    private Integer maxMembers;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
