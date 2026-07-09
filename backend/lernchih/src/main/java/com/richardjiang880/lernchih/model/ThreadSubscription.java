package com.richardjiang880.lernchih.model;

import com.richardjiang880.lernchih.model.enums.DigestFrequency;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A user's subscription to a thread with a chosen digest frequency (F33).
 * The {@code threadId} references a channel thread.
 */
@Entity
@Table(
    name = "thread_subscriptions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "thread_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreadSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "thread_id", nullable = false)
    private Long threadId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DigestFrequency frequency = DigestFrequency.NONE;

    @Column(name = "last_digest_at")
    private LocalDateTime lastDigestAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (frequency == null) {
            frequency = DigestFrequency.NONE;
        }
    }
}
