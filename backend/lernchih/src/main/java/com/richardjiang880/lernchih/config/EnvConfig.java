package com.richardjiang880.lernchih.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
/**
 * Environment configuration: fail-fast validation of required environment
 * variables and exposure of selected properties as beans.
 */
public class EnvConfig {

    /**
     * Validates that mandatory environment variables are present at startup.
     * Fails fast with a clear message naming the missing variable.
     */
    @PostConstruct
    void validateRequiredEnvVars() {
        requireEnv("JWT_SECRET");
        requireEnv("DB_PASSWORD");
    }

    private void requireEnv(String name) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Required environment variable '" + name
                            + "' is not set. Please define it (e.g. in /etc/lernchih/lernchih.env "
                            + "or your shell environment) before starting the application.");
        }
    }

    /**
     * Exposes the configured CORS allowed origins as a List<String> bean.
     * Consumed by SecurityConfig (Phase 1).
     */
    @Bean
    public List<String> corsAllowedOrigins(@Value("${app.cors.allowed-origins}") String origins) {
        return Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
