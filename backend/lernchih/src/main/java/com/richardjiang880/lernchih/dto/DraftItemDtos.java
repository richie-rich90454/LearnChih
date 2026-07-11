package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for the unified drafts inbox (F64).
 */
public final class DraftItemDtos {

    private DraftItemDtos() {}

    /**
     * A single row in the drafts inbox. {@code contentType} is derived from
     * the draft's post type, falling back to {@code NOTE} for standalone
     * compositions with no associated post.
     */
    public record DraftItemResponse(
        Long contentId,
        String contentType,
        String title,
        LocalDateTime updatedAt
    ) {}
}
