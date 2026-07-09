package com.richardjiang880.lernchih.model;

import com.richardjiang880.lernchih.model.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Persisted study-buddy suggestion record (F39). A row represents one
 * directional suggestion: {@code userId} is the user for whom the suggestion
 * was generated, {@code buddyId} is the suggested partner. The
 * {@link MatchStatus} field lets a user dismiss a suggestion so it does not
 * reappear on subsequent matching runs.
 */
@Entity
@Table(
    name = "study_buddy_matches",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "buddy_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyBuddyMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "buddy_id", nullable = false)
    private Long buddyId;

    @Column(name = "match_score", nullable = false)
    private Integer matchScore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MatchStatus status = MatchStatus.SUGGESTED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = MatchStatus.SUGGESTED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
