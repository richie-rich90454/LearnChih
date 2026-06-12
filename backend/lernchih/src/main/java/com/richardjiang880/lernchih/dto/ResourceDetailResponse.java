package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ResourceDetailResponse(
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
    LocalDateTime createdAt,
    Long threadId,
    List<PostResponse> posts
) {}
