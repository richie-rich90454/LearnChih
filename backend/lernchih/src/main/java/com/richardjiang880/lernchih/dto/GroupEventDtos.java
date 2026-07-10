package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for group events / meetups (F41).
 */
public final class GroupEventDtos {

    private GroupEventDtos() {}

    public record CreateEventRequest(
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String meetingUrl
    ) {}

    public record UpdateRsvpRequest(
        String status
    ) {}

    public record GroupEventResponse(
        Long id,
        Long groupId,
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        String meetingUrl,
        Long createdBy,
        String creatorName,
        int goingCount,
        int maybeCount,
        int notGoingCount,
        String viewerStatus,
        LocalDateTime createdAt
    ) {}

    public record RsvpResponse(
        Long id,
        Long eventId,
        Long userId,
        String userName,
        String status,
        LocalDateTime respondedAt
    ) {}
}
