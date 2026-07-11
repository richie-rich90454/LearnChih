package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for content-based resource recommendations (F23).
 */
public final class RecommendationDtos {

    private RecommendationDtos() {
    }

    /**
     * A single recommended resource. {@code score} is an opaque similarity
     * rank (higher is better) used only for ordering on the client.
     */
    public record RecommendationItem(
            Long id,
            String slug,
            String title,
            String description,
            String category,
            String type,
            Long subjectId,
            String subjectName,
            int upvoteCount,
            String authorName,
            double score,
            LocalDateTime createdAt
    ) {
    }
}
