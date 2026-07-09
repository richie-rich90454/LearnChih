package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public class FriendshipDtos {

    public record FriendshipResponse(
            Long id,
            Long userId,
            String name,
            String status,
            String direction,
            LocalDateTime createdAt
    ) {}
}
