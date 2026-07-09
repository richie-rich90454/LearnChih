package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * A node in a per-subject concept map (F6). Each node carries a label and an
 * (x, y) position on the SVG canvas so the map can be rendered and rearranged.
 * Backed by the {@code concept_map_nodes} table (Flyway V20260708100004).
 */
@Entity
@Table(name = "concept_map_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConceptMapNode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "subject_id", nullable = false)
    private Long subjectId;

    @Column(nullable = false)
    private String label;

    @Column(name = "pos_x", nullable = false)
    private Double posX;

    @Column(name = "pos_y", nullable = false)
    private Double posY;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (posX == null) {
            posX = 0.0;
        }
        if (posY == null) {
            posY = 0.0;
        }
    }
}
