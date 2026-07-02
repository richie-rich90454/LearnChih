package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for drafts (Task 8.2).
 */
public final class DraftDtos {

    private DraftDtos() {}

    public record DraftRequest(
        Long postId,
        String postType,
        String title,
        String content
    ) {}

    public record DraftResponse(
        Long id,
        Long userId,
        Long postId,
        String postType,
        String title,
        String content,
        LocalDateTime updatedAt
    ) {}
}
