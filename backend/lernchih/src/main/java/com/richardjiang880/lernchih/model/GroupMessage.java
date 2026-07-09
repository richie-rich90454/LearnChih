package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A chat message posted inside a study group (F32).
 */
@Entity
@Table(
    name = "group_messages",
    indexes = {
        @Index(name = "idx_group_messages_group", columnList = "study_group_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "study_group_id", nullable = false)
    private Long studyGroupId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "sent_at", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}
