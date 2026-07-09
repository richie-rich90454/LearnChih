package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * DTOs for user profile portfolios (F35).
 */
public class PortfolioItemDtos {

    public record PortfolioItemResponse(
        Long id,
        Long userId,
        String title,
        String description,
        String url,
        Integer displayOrder,
        LocalDateTime createdAt
    ) {}

    public record CreatePortfolioItemRequest(
        String title,
        String description,
        String url,
        Integer displayOrder
    ) {}

    public record UpdatePortfolioItemRequest(
        String title,
        String description,
        String url,
        Integer displayOrder
    ) {}

    private PortfolioItemDtos() {}
}
