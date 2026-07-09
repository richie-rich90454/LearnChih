package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for study-group chat messages (F32).
 */
public class GroupMessageDtos {

    public record GroupMessageResponse(
        Long id,
        Long studyGroupId,
        Long userId,
        String userName,
        String content,
        LocalDateTime sentAt
    ) {}

    public record SendGroupMessageRequest(
        String content
    ) {}

    private GroupMessageDtos() {}
}
