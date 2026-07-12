package com.richardjiang880.lernchih.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
/**
 * WebSocket configuration for real-time messaging via STOMP protocol.
 */
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Native WebSocket endpoint — all modern browsers support WebSocket
        // natively, so the SockJS fallback is no longer needed. This also
        // removes the deprecated `unload` event listener that sockjs-client
        // registers, which was flagged by Lighthouse.
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        // Client messages sent to /app/** are routed to @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
    }
}
