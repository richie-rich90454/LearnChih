package com.richardjiang880.opensolutions.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePostRequest(
    @NotBlank(message = "Content is required")
    String content
) {}
