package com.richardjiang880.lernchih.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserProfileResponse(
    Long id,
    String email,
    String name,
    String bio,
    String role,
    int credits,
    List<String> subjects,
    List<UserSocialDto> socials,
    LocalDateTime createdAt
) {}
