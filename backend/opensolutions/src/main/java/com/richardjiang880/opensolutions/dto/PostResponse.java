package com.richardjiang880.opensolutions.dto;

import java.time.LocalDateTime;

public record PostResponse(
    Long id,
    Long threadId,
    Long userId,
    String userName,
    String content,
    LocalDateTime createdAt
) {}
