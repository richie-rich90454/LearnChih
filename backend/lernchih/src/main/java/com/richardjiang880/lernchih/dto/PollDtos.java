package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTOs for polls (Task 8.2).
 */
public final class PollDtos {

    private PollDtos() {}

    public record CreatePollRequest(
        Long postId,
        String postType,
        String question,
        List<String> options
    ) {}

    public record VoteRequest(Long optionId) {}

    public record PollOptionResponse(Long id, String text, int voteCount) {}

    public record PollResponse(
        Long id,
        Long postId,
        String postType,
        String question,
        List<PollOptionResponse> options,
        LocalDateTime createdAt
    ) {}
}
