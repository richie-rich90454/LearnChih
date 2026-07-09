package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

public class BadgeDtos {

    public record FeaturedBadgeResponse(
            Long userBadgeId,
            Long badgeId,
            String name,
            String description,
            String icon,
            LocalDateTime earnedAt
    ) {}

    public record EarnedBadgeResponse(
            Long userBadgeId,
            Long badgeId,
            String name,
            String description,
            String icon,
            LocalDateTime earnedAt,
            Boolean featured
    ) {}

    public record SetFeaturedBadgesRequest(
            List<Long> badgeIds
    ) {}
}
