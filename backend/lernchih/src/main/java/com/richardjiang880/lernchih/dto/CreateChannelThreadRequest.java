package com.richardjiang880.lernchih.dto;

import com.richardjiang880.lernchih.model.enums.ContentFormat;
import jakarta.validation.constraints.NotBlank;

public record CreateChannelThreadRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Content is required")
    String content,

    ContentFormat format
) {}
