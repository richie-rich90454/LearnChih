package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record ResourceResponse(
    Long id,
    String title,
    String description,
    String category,
    String type,
    String filePath,
    String externalUrl,
    Long userId,
    String userName,
    Long subjectId,
    String subjectName,
    int upvoteCount,
    boolean upvotedByMe,
    LocalDateTime createdAt
) {}
