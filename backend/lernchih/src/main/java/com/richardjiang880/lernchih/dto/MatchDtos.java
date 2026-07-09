package com.richardjiang880.lernchih.dto;

/**
 * DTOs for study-buddy matching (F39).
 */
public final class MatchDtos {

    private MatchDtos() {}

    /**
     * A single suggested buddy surfaced to the user. {@code sharedSubjectCount}
     * is the number of subjects the two users have in common; {@code matchScore}
     * is a 0-100 affinity derived from that overlap.
     */
    public record BuddySuggestion(
        Long matchId,
        Long buddyId,
        String buddyName,
        Integer matchScore,
        Integer sharedSubjectCount,
        String status
    ) {}
}
