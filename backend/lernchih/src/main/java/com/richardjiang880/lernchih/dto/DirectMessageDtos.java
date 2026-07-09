package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for 1:1 direct messaging (F31).
 */
public class DirectMessageDtos {

    public record DirectMessageResponse(
        Long id,
        Long fromUserId,
        Long toUserId,
        String content,
        LocalDateTime sentAt,
        LocalDateTime readAt
    ) {}

    public record SendDirectMessageRequest(
        String content
    ) {}

    public record ConversationSummary(
        Long partnerId,
        String partnerName,
        LocalDateTime lastMessageAt,
        String lastMessagePreview,
        long unreadCount
    ) {}

    private DirectMessageDtos() {}
}
