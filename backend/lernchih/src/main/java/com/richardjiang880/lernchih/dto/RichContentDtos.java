package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for the rich-content feature (Task 8.1).
 */
public final class RichContentDtos {

    private RichContentDtos() {}

    /** Request body for POST /api/posts/{postId}/content. */
    public record RichContentRequest(String contentMarkdown, String contentHtml) {}

    /** Saved rich-content representation. */
    public record RichContentResponse(
        Long id,
        Long postId,
        String postType,
        String contentMarkdown,
        String contentHtml,
        LocalDateTime updatedAt
    ) {}

    /** Attachment metadata. */
    public record AttachmentResponse(
        Long id,
        Long postId,
        String postType,
        String filename,
        String filePath,
        Long fileSize,
        String mimeType,
        LocalDateTime createdAt
    ) {}
}
