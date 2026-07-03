package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EnvConfigTest {

    private final EnvConfig envConfig = new EnvConfig();

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
