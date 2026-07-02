package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record TypingEvent(
    Long threadId,
    Long userId,
    String userName,
    boolean typing,
    LocalDateTime timestamp
) {}
