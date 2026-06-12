package com.richardjiang880.opensolutions.dto;

import java.time.LocalDateTime;

public record ChannelResponse(
    Long id,
    String name,
    String description,
    int threadCount,
    LocalDateTime createdAt
) {}
