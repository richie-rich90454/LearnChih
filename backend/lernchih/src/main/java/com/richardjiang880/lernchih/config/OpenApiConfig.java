package com.richardjiang880.lernchih.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
/**
 * Springdoc OpenAPI documentation configuration.
 */
public class OpenApiConfig {

    @Bean
    public OpenAPI lernchihOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("LernChih API")
                        .version("1.0")
                        .description("REST API for the LernChih student learning resource and discussion platform."))
                .servers(List.of(new Server().url("http://localhost:38517")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .in(SecurityScheme.In.HEADER)
                                        .name("Authorization")));
    }
}
