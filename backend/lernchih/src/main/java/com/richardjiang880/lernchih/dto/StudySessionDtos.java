package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for study session logging (F7).
 */
public final class StudySessionDtos {

    private StudySessionDtos() {
    }

    public record LogSessionRequest(
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer durationMinutes,
            String type,
            Long resourceId
    ) {
    }

    public record StudySessionResponse(
            Long id,
            Long userId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer durationMinutes,
            String type,
            Long resourceId,
            LocalDateTime createdAt
    ) {
    }
}
