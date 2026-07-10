package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for inline annotations (F13). An annotation anchors a
 * quote from the resource and attaches the user's comment to it.
 */
public final class AnnotationDtos {

    private AnnotationDtos() {
    }

    public record CreateAnnotationRequest(
            Long resourceId,
            String quote,
            String content,
            Integer startOffset,
            Integer endOffset
    ) {
    }

    public record UpdateAnnotationRequest(
            String content
    ) {
    }

    public record AnnotationResponse(
            Long id,
            Long userId,
            Long resourceId,
            String quote,
            String content,
            Integer startOffset,
            Integer endOffset,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }
}
