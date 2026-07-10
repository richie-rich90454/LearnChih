package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for PDF highlights (F12). A highlight captures a text
 * span on a specific page along with an optional color and note.
 */
public final class PdfHighlightDtos {

    private PdfHighlightDtos() {
    }

    public record CreatePdfHighlightRequest(
            Long resourceId,
            Integer pageNumber,
            String highlightedText,
            String color,
            String note
    ) {
    }

    public record UpdatePdfHighlightRequest(
            String color,
            String note
    ) {
    }

    public record PdfHighlightResponse(
            Long id,
            Long userId,
            Long resourceId,
            Integer pageNumber,
            String highlightedText,
            String color,
            String note,
            LocalDateTime createdAt
    ) {
    }
}
