package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for the bundled SPA static asset serving and fallback behavior.
 *
 * <p>Uses the {@code local} profile with an embedded H2 database so the tests can
 * run without Docker. Test-specific static assets live under
 * {@code src/test/resources/static} and take precedence over the production build
 * artifacts during test execution.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
        "spring.profiles.active=local",
        "app.jwt.secret=test-jwt-secret-with-at-least-32-characters-long",
        "app.env.required-vars=",
        "app.seed.enabled=false"
})
class SpaFallbackFilterTest {

    @Value("${local.server.port}")
    private int port;

    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
    }

    private String url(String path) {
        return "http://localhost:" + port + path;
    }

    @Test
    void getIndexHtmlReturnsSpaHtml() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/index.html"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("<div id=\"root\">LernChih Test SPA</div>");
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().toString()).contains("text/html");
    }

    @Test
    void getJavaScriptAssetReturnsJavaScript() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/assets/main-test.js"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("LernChih test SPA bundle loaded");
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().toString()).contains("javascript");
    }

    @Test
    void getUnknownSpaRouteFallsBackToIndexHtml() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/resources/abc"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("<div id=\"root\">LernChih Test SPA</div>");
    }

    @Test
    void getApiEndpointReturnsJsonNotSpaHtml() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/api/resources"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).doesNotContain("<div id=\"root\">LernChih Test SPA</div>");
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().toString()).contains("application/json");
    }

    @Test
    void getActuatorHealthReturnsHealthJsonNotSpaHtml() {
        ResponseEntity<String> response = restTemplate.getForEntity(url("/actuator/health"), String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).doesNotContain("<div id=\"root\">LernChih Test SPA</div>");
        assertThat(response.getHeaders().getContentType()).isNotNull();
        assertThat(response.getHeaders().getContentType().toString()).contains("application/json");
    }
}
