package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.StompWebSocketEndpointRegistration;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class WebSocketConfigTest {

    private final WebSocketConfig config = new WebSocketConfig();

    @Test
    void registerStompEndpointsDoesNotThrow() {
        StompEndpointRegistry registry = mock(StompEndpointRegistry.class);
        StompWebSocketEndpointRegistration registration = mock(StompWebSocketEndpointRegistration.class);
        when(registry.addEndpoint("/ws")).thenReturn(registration);
        when(registration.setAllowedOriginPatterns("http://localhost:*")).thenReturn(registration);

        config.registerStompEndpoints(registry);
    }

    @Test
    void configureMessageBrokerDoesNotThrow() {
        config.configureMessageBroker(mock(MessageBrokerRegistry.class));
    }
}
