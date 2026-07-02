package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotBlank;

public record BroadcastMessage(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Body is required")
    String body
) {}
