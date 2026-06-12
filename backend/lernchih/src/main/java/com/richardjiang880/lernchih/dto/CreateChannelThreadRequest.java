package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateChannelThreadRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Content is required")
    String content
) {}
