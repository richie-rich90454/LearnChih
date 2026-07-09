package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for saved searches with email alerts (F34).
 */
public class SavedSearchDtos {

    public record SavedSearchResponse(
        Long id,
        Long userId,
        String name,
        String query,
        boolean emailAlerts,
        LocalDateTime lastNotifiedAt,
        LocalDateTime createdAt
    ) {}

    public record CreateSavedSearchRequest(
        String name,
        String query,
        Boolean emailAlerts
    ) {}

    public record UpdateSavedSearchRequest(
        String name,
        Boolean emailAlerts
    ) {}

    private SavedSearchDtos() {}
}
