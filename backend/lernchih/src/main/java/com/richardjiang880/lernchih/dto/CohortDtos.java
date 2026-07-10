package com.richardjiang880.lernchih.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTOs for cohort-based study groups (F40).
 */
public final class CohortDtos {

    private CohortDtos() {}

    public record CreateCohortRequest(
        String name,
        String description,
        Long subjectId,
        LocalDate startDate,
        LocalDate endDate,
        Integer maxMembers
    ) {}

    /** A cohort surfaced to the UI. {@code memberCount} is the current size;
     *  {@code role} is the requesting user's role in this cohort (null if not a member). */
    public record CohortResponse(
        Long id,
        String name,
        String description,
        Long subjectId,
        LocalDate startDate,
        LocalDate endDate,
        Integer maxMembers,
        Integer memberCount,
        String role,
        LocalDateTime createdAt
    ) {}

    public record CohortMemberResponse(
        Long id,
        Long userId,
        String userName,
        String role,
        LocalDateTime joinedAt
    ) {}
}
