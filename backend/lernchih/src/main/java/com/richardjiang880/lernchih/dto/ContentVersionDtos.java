package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for content versioning (Task 8.2).
 */
public final class ContentVersionDtos {

    private ContentVersionDtos() {}

    public record ContentVersionRequest(
        String contentMarkdown,
        String contentHtml
    ) {}

    public record ContentVersionResponse(
        Long id,
        Long postId,
        String postType,
        int versionNumber,
        String contentMarkdown,
        String contentHtml,
        Long createdBy,
        LocalDateTime createdAt
    ) {}
}
