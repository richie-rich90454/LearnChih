package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

public record ReportResponse(
    Long id,
    Long reporterId,
    String reporterName,
    String targetType,
    Long targetId,
    String reason,
    String status,
    Long resolvedBy,
    String resolvedByName,
    LocalDateTime resolvedAt,
    LocalDateTime createdAt
) {}
