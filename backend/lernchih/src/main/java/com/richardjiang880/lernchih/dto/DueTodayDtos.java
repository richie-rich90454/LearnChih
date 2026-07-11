package com.richardjiang880.lernchih.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * Request/response DTOs for the unified due-today review queue (F24).
 * Aggregates due flashcards, due resource review schedules, and
 * not-yet-attempted quizzes into a single prioritised list.
 */
public final class DueTodayDtos {

    private DueTodayDtos() {
    }

    public enum DueItemType {
        FLASHCARD,
        RESOURCE_REVIEW,
        QUIZ
    }

    public record DueItem(
            DueItemType type,
            Long id,
            String title,
            String subtitle,
            LocalDate dueDate,
            String destination
    ) {
    }

    public record DueTodayResponse(
            List<DueItem> items,
            int totalCount
    ) {
    }
}
