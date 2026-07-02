package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotBlank;

public record StudyGroupRequest(
    @NotBlank(message = "Group name is required")
    String name,

    String description
) {}
