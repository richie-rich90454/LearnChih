package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for shared whiteboards (F42).
 */
public final class WhiteboardDtos {

    private WhiteboardDtos() {}

    public record CreateWhiteboardRequest(
        String title
    ) {}

    public record UpdateWhiteboardRequest(
        String title,
        String content
    ) {}

    public record WhiteboardResponse(
        Long id,
        Long groupId,
        String title,
        String content,
        Long createdBy,
        String creatorName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}
}
