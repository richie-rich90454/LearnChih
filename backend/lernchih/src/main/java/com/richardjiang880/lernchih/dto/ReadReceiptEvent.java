package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record ReadReceiptEvent(
    Long threadId,
    Long postId,
    Long userId,
    LocalDateTime readAt
) {}
