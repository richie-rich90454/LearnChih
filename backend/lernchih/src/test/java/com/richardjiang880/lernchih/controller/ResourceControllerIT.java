package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceControllerIT extends AbstractControllerIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private ResourceThreadRepository resourceThreadRepository;
    @Autowired
    private UpvoteRepository upvoteRepository;

    @BeforeEach
    void cleanUp() {
        upvoteRepository.deleteAll();
        resourceThreadRepository.deleteAll();
        resourceRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getResourcesIsPublic() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/resources", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void createResourceAsAuthenticatedUser() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        HttpHeaders headers = authHeaders(token);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("title", "My Resource");
        body.add("description", "A description");
        body.add("category", ResourceCategory.ARTICLE.name());
        body.add("type", ResourceType.LINK.name());
        body.add("externalUrl", "https://example.com");

        ResponseEntity<ResourceResponse> response = restTemplate.exchange(
                "/api/resources",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                ResourceResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().title()).isEqualTo("My Resource");
        assertThat(response.getBody().type()).isEqualTo(ResourceType.LINK.name());

        User user = userRepository.findByEmail("alice@example.com").orElseThrow();
        assertThat(user.getCredits()).isEqualTo(10);
    }

    @Test
    void getResourceDetailBySlugIsPublic() {
        User user = createVerifiedUser("owner@example.com", "Owner", Role.STUDENT);
        Resource resource = Resource.builder()
                .slug("my-resource")
                .title("My Resource")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .externalUrl("https://example.com")
                .user(user)
                .upvoteCount(0)
                .build();
        resource = resourceRepository.save(resource);
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());

        ResponseEntity<ResourceDetailResponse> response = restTemplate.getForEntity(
                "/api/resources/my-resource", ResourceDetailResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().title()).isEqualTo("My Resource");
        assertThat(response.getBody().upvotedByMe()).isFalse();
    }

    @Test
    void deleteResourceAsAdmin() {
        User owner = createVerifiedUser("owner@example.com", "Owner", Role.STUDENT);
        User admin = createVerifiedUser("admin@example.com", "Admin", Role.ADMIN);
        Resource resource = Resource.builder()
                .slug("to-delete")
                .title("To Delete")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(owner)
                .upvoteCount(0)
                .build();
        resource = resourceRepository.save(resource);
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());

        String token = obtainAccessToken("admin@example.com");
        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/resources/" + resource.getId(),
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(token)),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(resourceRepository.findById(resource.getId())).isEmpty();
    }

    @Test
    void studentCannotDeleteResource() {
        User student = createVerifiedUser("student@example.com", "Student", Role.STUDENT);
        Resource resource = Resource.builder()
                .slug("protected")
                .title("Protected")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(student)
                .upvoteCount(0)
                .build();
        resource = resourceRepository.save(resource);
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());

        String token = obtainAccessToken("student@example.com");
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/resources/" + resource.getId(),
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(token)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("Only admins and moderators");
    }

    @Test
    void toggleUpvoteRequiresAuthentication() {
        User owner = createVerifiedUser("owner@example.com", "Owner", Role.STUDENT);
        Resource resource = Resource.builder()
                .slug("upvote-me")
                .title("Upvote Me")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(owner)
                .upvoteCount(0)
                .build();
        resource = resourceRepository.save(resource);
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());

        ResponseEntity<String> anonymous = restTemplate.postForEntity(
                "/api/resources/" + resource.getId() + "/upvote", null, String.class);
        assertThat(anonymous.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        ResponseEntity<Void> authenticated = restTemplate.exchange(
                "/api/resources/" + resource.getId() + "/upvote",
                HttpMethod.POST,
                new HttpEntity<>(authHeaders(token)),
                Void.class);
        assertThat(authenticated.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void getLeaderboardIsPublic() {
        ResponseEntity<List<LeaderboardEntry>> response = restTemplate.exchange(
                "/api/resources/leaderboard",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void createUploadResourceWithFile() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        HttpHeaders headers = authHeaders(token);
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("title", "Upload Resource");
        body.add("description", "Desc");
        body.add("category", ResourceCategory.PDF.name());
        body.add("type", ResourceType.UPLOAD.name());
        byte[] content = new byte[]{(byte) 0x25, 0x50, 0x44, 0x46};
        body.add("file", new MockMultipartFile("file", "doc.pdf", "application/pdf", content).getResource());

        ResponseEntity<ResourceResponse> response = restTemplate.exchange(
                "/api/resources",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                ResourceResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().filePath()).isNotBlank();
    }
}
