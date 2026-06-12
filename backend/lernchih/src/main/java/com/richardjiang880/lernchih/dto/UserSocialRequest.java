package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotBlank;

public record UserSocialRequest(
    @NotBlank(message = "Platform is required")
    String platform,

    @NotBlank(message = "URL is required")
    String url
) {}
