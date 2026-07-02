package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record SearchResult(
    String type,
    Long id,
    String title,
    String description,
    String slug,
    LocalDateTime createdAt
) {}
