package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request/response DTOs for course module completion tracking (F3).
 */
public final class CourseProgressDtos {

    private CourseProgressDtos() {
    }

    public record ModuleResponse(
            Long id,
            Long courseId,
            String title,
            Integer sortOrder,
            Integer durationMinutes
    ) {
    }

    public record ModuleProgressItem(
            ModuleResponse module,
            boolean completed,
            LocalDateTime completedAt,
            Integer score
    ) {
    }

    public record CompleteModuleRequest(Integer score) {
    }

    public record CourseProgressResponse(
            Long courseId,
            String courseName,
            int completedCount,
            int totalModules,
            List<ModuleProgressItem> modules
    ) {
    }
}
