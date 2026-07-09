package com.richardjiang880.lernchih.dto;

import java.util.List;

/**
 * Request/response DTOs for AI quiz generation (F5). The generator produces
 * multiple-choice questions from a resource's content; the save endpoint
 * persists them into a new {@code quizzes} row with linked
 * {@code quiz_questions}.
 */
public final class AiQuizDtos {

    private AiQuizDtos() {
    }

    public record GeneratedQuizQuestion(
            String question,
            List<String> options,
            int answerIndex,
            String explanation
    ) {
    }

    public record GenerateResponse(List<GeneratedQuizQuestion> questions) {
    }

    public record SaveRequest(String quizTitle, List<GeneratedQuizQuestion> questions) {
    }

    public record SaveResponse(Long quizId, int savedCount) {
    }
}
