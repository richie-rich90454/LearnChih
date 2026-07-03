package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

class AdminControllerIT extends AbstractControllerIntegrationTest {

    @Autowired
    private ReportRepository reportRepository;
    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private ResourceThreadRepository resourceThreadRepository;
    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private ChannelThreadRepository channelThreadRepository;
    @Autowired
    private ChannelPostRepository channelPostRepository;
    @Autowired
    private UpvoteRepository upvoteRepository;

    @BeforeEach
    void cleanUp() {
        reportRepository.deleteAll();
        channelPostRepository.deleteAll();
        channelThreadRepository.deleteAll();
        resourceThreadRepository.deleteAll();
        upvoteRepository.deleteAll();
        resourceRepository.deleteAll();
        channelRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void adminCanListPendingReports() {
        createAdminAndReporterWithReport();
        String token = obtainAccessToken("admin@example.com");

        ResponseEntity<Page<ReportResponse>> response = restTemplate.exchange(
                "/api/admin/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).hasSize(1);
    }

    @Test
    void studentCannotAccessAdminReports() {
        registerAndVerify("student@example.com", "Student", Role.STUDENT);
        String token = obtainAccessToken("student@example.com");

        ResponseEntity<String> response = restTemplate.exchange(
                "/api/admin/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void adminCanResolveReport() {
        Report report = createAdminAndReporterWithReport();
        String token = obtainAccessToken("admin@example.com");

        ResponseEntity<ReportResponse> response = restTemplate.exchange(
                "/api/admin/reports/" + report.getId() + "/resolve",
                HttpMethod.PUT,
                new HttpEntity<>(new ResolveReportRequest("resolve"), authHeaders(token)),
                ReportResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(ReportStatus.RESOLVED.name());
        assertThat(response.getBody().resolvedByName()).isEqualTo("Admin");
    }

    @Test
    void adminCanDismissReport() {
        Report report = createAdminAndReporterWithReport();
        String token = obtainAccessToken("admin@example.com");

        ResponseEntity<ReportResponse> response = restTemplate.exchange(
                "/api/admin/reports/" + report.getId() + "/resolve",
                HttpMethod.PUT,
                new HttpEntity<>(new ResolveReportRequest("dismiss"), authHeaders(token)),
                ReportResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(ReportStatus.DISMISSED.name());
    }

    @Test
    void adminCanDeleteResource() {
        User owner = createVerifiedUser("owner@example.com", "Owner", Role.STUDENT);
        createVerifiedUser("admin@example.com", "Admin", Role.ADMIN);
        Resource resource = resourceRepository.save(Resource.builder()
                .slug("admin-delete")
                .title("Delete Me")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(owner)
                .upvoteCount(0)
                .build());
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());
        String token = obtainAccessToken("admin@example.com");

        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/admin/resources/" + resource.getId(),
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(token)),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(resourceRepository.findById(resource.getId())).isEmpty();
    }

    @Test
    void adminCanDeleteChannelPost() {
        createVerifiedUser("admin@example.com", "Admin", Role.ADMIN);
        User user = createVerifiedUser("poster@example.com", "Poster", Role.STUDENT);
        Channel channel = channelRepository.save(Channel.builder().name("Java").slug("java").build());
        ChannelThread thread = channelThreadRepository.save(ChannelThread.builder()
                .channel(channel)
                .title("Thread")
                .content("Body")
                .user(user)
                .build());
        ChannelPost post = channelPostRepository.save(ChannelPost.builder()
                .thread(thread)
                .user(user)
                .content("Post")
                .build());
        String token = obtainAccessToken("admin@example.com");

        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/admin/posts/" + post.getId() + "?type=channel",
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(token)),
                Void.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(channelPostRepository.findById(post.getId())).isEmpty();
    }

    private Report createAdminAndReporterWithReport() {
        User admin = createVerifiedUser("admin@example.com", "Admin", Role.ADMIN);
        User reporter = createVerifiedUser("reporter@example.com", "Reporter", Role.STUDENT);
        Report report = Report.builder()
                .reporter(reporter)
                .targetType(ReportTargetType.RESOURCE)
                .targetId(1L)
                .reason("Spam")
                .status(ReportStatus.PENDING)
                .build();
        return reportRepository.save(report);
    }
}
