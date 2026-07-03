package com.richardjiang880.lernchih.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatNoException;

class PushServiceTest {

    private final PushService pushService = new PushService();

    @Test
    void sendPushDoesNotThrow() {
        assertThatNoException().isThrownBy(() -> pushService.sendPush(1L, "Title", "Body"));
    }
}
