package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A screen-share session attached to a study group (F44).
 *
 * <p>The backend owns only the lifecycle metadata (start / list / end).
 * Real-time screen capture is handled client-side via {@code getDisplayMedia};
 * the {@code endedAt} field being {@code null} signals an active session.
 */
@Entity
@Table(name = "screen_share_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScreenShareSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_group_id", nullable = false)
    private Long studyGroupId;

    @Column(name = "sharer_user_id", nullable = false)
    private Long sharerUserId;

    @Column(name = "started_at", nullable = false, updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @PrePersist
    protected void onCreate() {
        startedAt = LocalDateTime.now();
    }
}
