package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * A highlight extracted from a PDF resource (F12). Each highlight stores the
 * page number, the extracted text, an optional color tag, and a free-form
 * note. Highlights are scoped per user per resource so each reader keeps their
 * own annotation set.
 */
@Entity
@Table(name = "pdf_highlights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfHighlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(name = "highlighted_text", columnDefinition = "TEXT", nullable = false)
    private String highlightedText;

    @Column
    private String color;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
