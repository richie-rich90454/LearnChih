package com.richardjiang880.lernchih.dto;

import com.richardjiang880.lernchih.model.enums.DigestFrequency;

import java.time.LocalDateTime;

/**
 * DTOs for per-thread subscription digest frequency (F33).
 */
public class ThreadSubscriptionDtos {

    public record ThreadSubscriptionResponse(
        Long id,
        Long userId,
        Long threadId,
        DigestFrequency frequency,
        LocalDateTime lastDigestAt
    ) {}

    public record UpdateSubscriptionRequest(
        DigestFrequency frequency
    ) {}

    private ThreadSubscriptionDtos() {}
}
