package com.richardjiang880.lernchih.dto;

/**
 * DTOs for tags (Task 8.2).
 */
public final class TagDtos {

    private TagDtos() {}

    public record CreateTagRequest(String name) {}

    public record AssignTagRequest(Long tagId) {}

    public record TagResponse(Long id, String name) {}
}
