package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.ResourceThreadRepository;
import com.richardjiang880.lernchih.repository.UpvoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

import static org.assertj.core.api.Assertions.assertThat;

class SeoControllerIT extends AbstractControllerIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;
    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private ResourceThreadRepository resourceThreadRepository;
    @Autowired
    private UpvoteRepository upvoteRepository;

    @BeforeEach
    void cleanUp() {
        upvoteRepository.deleteAll();
        resourceThreadRepository.deleteAll();
        resourceRepository.deleteAll();
        channelRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void robotsTxtIsPublic() {
        ResponseEntity<String> response = restTemplate.getForEntity("/robots.txt", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.TEXT_PLAIN);
        assertThat(response.getBody()).contains("Disallow: /api/");
        assertThat(response.getBody()).contains("Sitemap:");
    }

    @Test
    void sitemapIndexIsPublic() {
        ResponseEntity<String> response = restTemplate.getForEntity("/sitemap.xml", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_XML);
        assertThat(response.getBody()).contains("<sitemapindex");
        assertThat(response.getBody()).contains("sitemap-resources.xml");
        assertThat(response.getBody()).contains("sitemap-channels.xml");
        assertThat(response.getBody()).contains("sitemap-static.xml");
    }

    @Test
    void sitemapResourcesListsPublicResources() {
        User user = createVerifiedUser("owner@example.com", "Owner", Role.STUDENT);
        Resource resource = resourceRepository.save(Resource.builder()
                .slug("public-resource")
                .title("Public Resource")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .externalUrl("https://example.com")
                .user(user)
                .upvoteCount(0)
                .build());
        resourceThreadRepository.save(ResourceThread.builder().resource(resource).build());

        ResponseEntity<String> response = restTemplate.getForEntity("/sitemap-resources.xml", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("public-resource");
        assertThat(response.getBody()).contains("<urlset");
    }

    @Test
    void sitemapChannelsListsPublicChannels() {
        channelRepository.save(Channel.builder().name("Java").slug("java").description("Java channel").build());

        ResponseEntity<String> response = restTemplate.getForEntity("/sitemap-channels.xml", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("java");
        assertThat(response.getBody()).contains("<urlset");
    }

    @Test
    void sitemapStaticListsStaticRoutes() {
        ResponseEntity<String> response = restTemplate.getForEntity("/sitemap-static.xml", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).contains("<urlset");
        assertThat(response.getBody()).contains("/resources");
        assertThat(response.getBody()).contains("/channels");
        assertThat(response.getBody()).contains("/leaderboard");
    }
}
