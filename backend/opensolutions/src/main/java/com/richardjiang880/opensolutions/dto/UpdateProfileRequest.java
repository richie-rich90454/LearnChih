package com.richardjiang880.opensolutions.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
    @NotBlank(message = "Name is required")
    String name,

    String bio
) {}
