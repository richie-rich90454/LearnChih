package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A voice room attached to a study group (F43).
 *
 * <p>This is the basic version: the backend only owns the room lifecycle
 * (create / list / end). Real-time audio transport is handled on the client
 * via {@code getUserMedia}; the {@code active} flag signals whether a room
 * is currently live and joinable.
 */
@Entity
@Table(name = "voice_rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoiceRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_group_id", nullable = false)
    private Long studyGroupId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) {
            active = true;
        }
    }
}
