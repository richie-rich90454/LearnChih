package com.richardjiang880.lernchih.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public record ChannelResponse(
    Long id,
    String slug,
    String name,
    String description,
    int threadCount,
    LocalDateTime createdAt
) implements Serializable {
    private static final long serialVersionUID = 1L;
}
