package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A meetup / event attached to a study group (F41).
 */
@Entity
@Table(name = "group_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(length = 255)
    private String location;

    @Column(name = "meeting_url", length = 500)
    private String meetingUrl;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
