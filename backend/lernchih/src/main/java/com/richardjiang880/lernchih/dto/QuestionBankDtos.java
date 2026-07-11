package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Request/response DTOs for the question bank endpoints (F18). These back
 * {@code /api/question-bank}: listing, creating, updating, deleting, and
 * importing a bank question into a quiz (which creates a new
 * {@code quiz_questions} row).
 */
public final class QuestionBankDtos {

    private QuestionBankDtos() {
    }

    public record QuestionBankRequest(
            String question,
            List<String> options,
            Integer answerIndex,
            String explanation,
            String tags
    ) {
    }

    public record QuestionBankResponse(
            Long id,
            Long ownerUserId,
            String question,
            List<String> options,
            Integer answerIndex,
            String explanation,
            String tags,
            LocalDateTime createdAt
    ) {
    }

    public record ImportRequest(Long quizId) {
    }

    public record ImportResponse(Long quizQuestionId, Long quizId) {
    }
}
