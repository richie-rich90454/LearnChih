package com.richardjiang880.lernchih.seeder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Optionally seeds an OpenSearch {@code courses} index with sample documents.
 *
 * <p>Enabled with {@code app.opensearch.seed.enabled=true}. The runner creates
 * the index (with the mapping from {@code classpath:opensearch/courses-index.json})
 * if it does not already exist, then bulk-indexes the sample documents from
 * {@code classpath:opensearch/courses-seed.json}.
 *
 * <p>This component is best-effort: if OpenSearch is unreachable, the error is
 * logged but startup is not aborted.
 */
@Component
@ConditionalOnProperty(name = "app.opensearch.seed.enabled", havingValue = "true")
public class OpenSearchSeedRunner {

    private static final Logger log = LoggerFactory.getLogger(OpenSearchSeedRunner.class);
    private static final String INDEX_NAME = "courses";

    @Value("${app.opensearch.host:localhost}")
    private String host;

    @Value("${app.opensearch.port:9200}")
    private int port;

    @Value("classpath:opensearch/courses-index.json")
    private Resource indexMappingResource;

    @Value("classpath:opensearch/courses-seed.json")
    private Resource seedDocumentsResource;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void seed() {
        String baseUrl = "http://" + host + ":" + port;
        log.info("OpenSearch seed enabled - targeting {}", baseUrl);

        try {
            createIndexIfAbsent(baseUrl);
            bulkIndexDocuments(baseUrl);
            log.info("OpenSearch courses index seeded successfully.");
        } catch (IOException e) {
            log.error("Failed to read OpenSearch seed resources", e);
        } catch (Exception e) {
            log.error("Failed to seed OpenSearch courses index - is OpenSearch running at {}?", baseUrl, e);
        }
    }

    private void createIndexIfAbsent(String baseUrl) throws IOException {
        String indexUrl = baseUrl + "/" + INDEX_NAME;
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    indexUrl, HttpMethod.HEAD, new HttpEntity<>(headers()), String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("OpenSearch index '{}' already exists, skipping mapping creation.", INDEX_NAME);
                return;
            }
        } catch (HttpClientErrorException.NotFound e) {
            // Index does not exist - proceed to create it.
        }

        String mapping = new String(indexMappingResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        HttpEntity<String> request = new HttpEntity<>(mapping, headers());
        ResponseEntity<String> response = restTemplate.exchange(indexUrl, HttpMethod.PUT, request, String.class);
        log.info("Created OpenSearch index '{}': {}", INDEX_NAME, response.getStatusCode());
    }

    private void bulkIndexDocuments(String baseUrl) throws IOException {
        String json = new String(seedDocumentsResource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        List<Map<String, Object>> documents = objectMapper.readValue(json, new TypeReference<>() {});

        if (documents.isEmpty()) {
            log.info("No OpenSearch seed documents found.");
            return;
        }

        StringBuilder bulkBody = new StringBuilder();
        for (Map<String, Object> doc : documents) {
            Object id = doc.get("id");
            String action = "{\"index\":{\"_index\":\"" + INDEX_NAME + "\",\"_id\":\"" + id + "\"}}\n";
            bulkBody.append(action);
            bulkBody.append(objectMapper.writeValueAsString(doc)).append("\n");
        }

        HttpEntity<String> request = new HttpEntity<>(bulkBody.toString(), headers());
        ResponseEntity<String> response = restTemplate.exchange(
                baseUrl + "/_bulk", HttpMethod.POST, request, String.class);

        if (response.getBody() != null && !response.getBody().isBlank()) {
            JsonNode root = objectMapper.readTree(response.getBody());
            boolean hasErrors = root.path("errors").asBoolean(false);
            int indexed = root.path("items").size();
            if (hasErrors) {
                log.warn("OpenSearch bulk indexing completed with errors. Indexed {} documents.", indexed);
            } else {
                log.info("Bulk indexed {} documents into OpenSearch '{}'.", indexed, INDEX_NAME);
            }
        }
    }

    private HttpHeaders headers() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
