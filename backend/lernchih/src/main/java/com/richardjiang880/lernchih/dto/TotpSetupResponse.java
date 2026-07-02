package com.richardjiang880.lernchih.dto;

public record TotpSetupResponse(
    String secret,
    String qrUri
) {}
