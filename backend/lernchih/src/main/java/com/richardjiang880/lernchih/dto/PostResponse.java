package com.richardjiang880.lernchih.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record PostResponse(
    Long id,
    Long threadId,
    Long userId,
    String userName,
    String content,
    LocalDateTime createdAt
) implements Serializable {
    private static final long serialVersionUID = 1L;
}
