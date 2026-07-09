package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;

/**
 * Request/response DTOs for study playlists (F2).
 */
public final class PlaylistDtos {

    private PlaylistDtos() {
    }

    public record CreatePlaylistRequest(String name, String description) {
    }

    public record UpdatePlaylistRequest(String name, String description) {
    }

    public record AddItemRequest(Long resourceId) {
    }

    public record PlaylistResponse(
            Long id,
            Long userId,
            String name,
            String description,
            LocalDateTime createdAt,
            Integer itemCount
    ) {
    }

    public record PlaylistItemResponse(
            Long id,
            Long playlistId,
            Long resourceId,
            String resourceTitle,
            Integer sortOrder,
            LocalDateTime addedAt
    ) {
    }

    public record PlaylistDetailResponse(
            Long id,
            Long userId,
            String name,
            String description,
            LocalDateTime createdAt,
            Integer itemCount,
            java.util.List<PlaylistItemResponse> items
    ) {
    }
}
