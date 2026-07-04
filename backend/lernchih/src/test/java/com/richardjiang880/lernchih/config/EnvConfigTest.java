package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EnvConfigTest {

    private final EnvConfig envConfig = new EnvConfig();

    @Test
    @EnabledIfEnvironmentVariable(named = "JWT_SECRET", matches = ".+")
    @EnabledIfEnvironmentVariable(named = "DB_PASSWORD", matches = ".+")
    void validateRequiredEnvVarsSucceedsWhenVariablesSet() {
        ReflectionTestUtils.setField(envConfig, "requiredVars", "JWT_SECRET,DB_PASSWORD");
        envConfig.validateRequiredEnvVars();
    }

    @Test
    void requireEnvThrowsForMissingVariable() {
        assertThatThrownBy(() -> ReflectionTestUtils.invokeMethod(envConfig, "requireEnv", "LEARNCHIH_TEST_NONEXISTENT_VAR"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("LEARNCHIH_TEST_NONEXISTENT_VAR");
    }

    @Test
    void corsAllowedOriginsSplitsCommaSeparatedString() {
        List<String> origins = envConfig.corsAllowedOrigins("http://localhost:5173,http://localhost:3000");

        assertThat(origins).containsExactly("http://localhost:5173", "http://localhost:3000");
    }

    @Test
    void corsAllowedOriginsTrimsWhitespace() {
        List<String> origins = envConfig.corsAllowedOrigins(" http://a.com , http://b.com ");

        assertThat(origins).containsExactly("http://a.com", "http://b.com");
    }

    @Test
    void corsAllowedOriginsFiltersEmptyEntries() {
        List<String> origins = envConfig.corsAllowedOrigins("http://a.com,, ,http://b.com");

        assertThat(origins).containsExactly("http://a.com", "http://b.com");
    }

    @Test
    void corsAllowedOriginsReturnsEmptyListForEmptyString() {
        List<String> origins = envConfig.corsAllowedOrigins("");

        assertThat(origins).isEmpty();
    }
}
