package com.richardjiang880.lernchih.model;

import com.richardjiang880.lernchih.model.enums.RsvpStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A user's RSVP response to a group event (F41).
 */
@Entity
@Table(name = "event_rsvps",
    uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventRsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    @Builder.Default
    private RsvpStatus status = RsvpStatus.GOING;

    @Column(name = "responded_at", nullable = false, updatable = false)
    private LocalDateTime respondedAt;

    @PrePersist
    protected void onCreate() {
        respondedAt = LocalDateTime.now();
    }
}
