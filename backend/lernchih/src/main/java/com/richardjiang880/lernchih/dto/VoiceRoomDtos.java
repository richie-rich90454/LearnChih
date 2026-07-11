package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for study-group voice rooms (F43).
 */
public final class VoiceRoomDtos {

    private VoiceRoomDtos() {}

    public record CreateVoiceRoomRequest(
        String name
    ) {}

    public record VoiceRoomResponse(
        Long id,
        Long studyGroupId,
        String name,
        boolean active,
        Long createdBy,
        String creatorName,
        LocalDateTime createdAt
    ) {}
}
