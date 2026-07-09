package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A single resource entry inside a Playlist, with an explicit order (F2).
 */
@Entity
@Table(name = "playlist_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlaylistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "playlist_id", nullable = false)
    private Long playlistId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
        if (sortOrder == null) {
            sortOrder = 0;
        }
    }
}
