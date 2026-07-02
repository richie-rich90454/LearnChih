package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record ChannelResponse(
    Long id,
    String slug,
    String name,
    String description,
    int threadCount,
    LocalDateTime createdAt
) {}
