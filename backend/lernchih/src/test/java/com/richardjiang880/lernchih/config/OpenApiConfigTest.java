package com.richardjiang880.lernchih.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenApiConfigTest {

    private final OpenApiConfig config = new OpenApiConfig();

    @Test
    void openApiConfigurationHasExpectedMetadata() {
        OpenAPI api = config.lernchihOpenAPI();

        assertThat(api.getInfo().getTitle()).isEqualTo("LernChih API");
        assertThat(api.getInfo().getVersion()).isEqualTo("1.0");
        assertThat(api.getComponents().getSecuritySchemes()).containsKey("bearer-jwt");
    }
}
