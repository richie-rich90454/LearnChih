package com.richardjiang880.lernchih.service;

import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TotpServiceTest {

    private final TotpService totpService = new TotpService();
    private final DefaultCodeGenerator codeGenerator = new DefaultCodeGenerator();
    private final SystemTimeProvider timeProvider = new SystemTimeProvider();

    @Test
    void generateSecretReturnsNonBlankString() {
        String secret = totpService.generateSecret();

        assertThat(secret).isNotBlank();
        assertThat(secret).hasSizeGreaterThanOrEqualTo(32);
    }

    @Test
    void generateSecretReturnsDifferentValuesOnSubsequentCalls() {
        String secret1 = totpService.generateSecret();
        String secret2 = totpService.generateSecret();

        assertThat(secret1).isNotEqualTo(secret2);
    }

    @Test
    void verifyCodeReturnsTrueForCurrentCode() throws Exception {
        String secret = totpService.generateSecret();
        long now = timeProvider.getTime();
        String code = codeGenerator.generate(secret, now / 30);

        assertThat(totpService.verifyCode(secret, code)).isTrue();
    }

    @Test
    void verifyCodeReturnsFalseForInvalidCode() {
        String secret = totpService.generateSecret();

        assertThat(totpService.verifyCode(secret, "123456")).isFalse();
    }
}
