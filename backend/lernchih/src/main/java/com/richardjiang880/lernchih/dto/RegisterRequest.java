package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
    @NotBlank(message = "Email is required")
    String email,

    @NotBlank(message = "Password is required")
    String password,

    @NotBlank(message = "Name is required")
    String name
) {}
