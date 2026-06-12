package com.richardjiang880.lernchih.dto;

public record LeaderboardEntry(
    Long userId,
    String name,
    String email,
    int credits
) {}
