package com.richardjiang880.lernchih.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Request/response DTOs for the spaced-repetition review scheduler (F1).
 */
public final class ReviewScheduleDtos {

    private ReviewScheduleDtos() {
    }

    public record ScheduleRequest(Long resourceId) {
    }

    /** Quality of recall: 0-5 per the SM-2 algorithm. */
    public record CompleteRequest(Integer quality) {
    }

    public record ReviewScheduleResponse(
            Long id,
            Long userId,
            Long resourceId,
            String resourceTitle,
            LocalDate dueDate,
            Integer intervalDays,
            Double easeFactor,
            Integer reviewCount,
            LocalDateTime createdAt
    ) {
    }
}
