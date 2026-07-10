package com.richardjiang880.lernchih.model;

import com.richardjiang880.lernchih.model.enums.CohortRole;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Membership link between a user and a cohort (F40). The unique constraint on
 * (cohort_id, user_id) prevents duplicate joins. {@link CohortRole} distinguishes
 * the cohort leader from regular members.
 */
@Entity
@Table(
    name = "cohort_members",
    uniqueConstraints = @UniqueConstraint(columnNames = {"cohort_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CohortMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cohort_id", nullable = false)
    private Long cohortId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private CohortRole role = CohortRole.MEMBER;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
