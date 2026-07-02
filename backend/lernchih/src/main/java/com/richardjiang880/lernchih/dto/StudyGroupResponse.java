package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record StudyGroupResponse(
    Long id,
    String name,
    String description,
    Long ownerUserId,
    LocalDateTime createdAt,
    long memberCount
) {}
