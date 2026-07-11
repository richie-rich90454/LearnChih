package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for study-group screen-share sessions (F44).
 */
public final class ScreenShareDtos {

    private ScreenShareDtos() {}

    public record CreateScreenShareRequest(
        String name
    ) {}

    public record ScreenShareResponse(
        Long id,
        Long studyGroupId,
        Long sharerUserId,
        String sharerName,
        LocalDateTime startedAt,
        LocalDateTime endedAt,
        boolean active
    ) {}
}
