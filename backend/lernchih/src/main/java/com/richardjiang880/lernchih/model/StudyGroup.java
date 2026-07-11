package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "owner_user_id", nullable = false)
    private Long ownerUserId;

    /** Cohort window start (F40). Nullable for groups without a fixed cohort. */
    @Column(name = "cohort_start_date")
    private LocalDate cohortStartDate;

    /** Cohort window end (F40). Nullable. */
    @Column(name = "cohort_end_date")
    private LocalDate cohortEndDate;

    /** Membership cap (F40). Nullable = unlimited. */
    @Column(name = "max_members")
    private Integer maxMembers;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
