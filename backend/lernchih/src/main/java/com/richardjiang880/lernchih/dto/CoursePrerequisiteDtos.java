package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for course prerequisite graph management (F19).
 */
public final class CoursePrerequisiteDtos {

    private CoursePrerequisiteDtos() {}

    public record CreatePrerequisiteRequest(
        Long prerequisiteCourseId
    ) {}

    public record PrerequisiteResponse(
        Long id,
        Long courseId,
        Long prerequisiteCourseId,
        String prerequisiteCourseName,
        LocalDateTime createdAt
    ) {}

    public record PrerequisiteStatusResponse(
        Long courseId,
        boolean satisfied,
        java.util.List<PrerequisiteGap> gaps
    ) {}

    public record PrerequisiteGap(
        Long prerequisiteCourseId,
        String prerequisiteCourseName,
        boolean completed
    ) {}
}
