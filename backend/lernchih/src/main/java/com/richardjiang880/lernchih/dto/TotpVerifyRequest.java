package com.richardjiang880.lernchih.dto;

import jakarta.validation.constraints.NotNull;

public record TotpVerifyRequest(
    @NotNull(message = "TOTP code is required")
    String code
) {}
