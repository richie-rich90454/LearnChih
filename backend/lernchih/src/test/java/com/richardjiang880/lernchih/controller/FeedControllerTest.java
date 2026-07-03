package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ResourceCategory;
import com.richardjiang880.lernchih.model.ResourceType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeedControllerTest {

    @Mock
    private ResourceRepository resourceRepository;

    private FeedController controller;
    private Resource resource;

    @BeforeEach
    void setUp() {
        controller = new FeedController(resourceRepository, "http://localhost:5173/");
        User user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
        resource = Resource.builder()
                .slug("intro")
                .title("Intro")
                .description("desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();
        resource.setId(10L);
    }

    @Test
    void rssFeedContainsResource() {
        when(resourceRepository.findTop20ByOrderByCreatedAtDesc()).thenReturn(List.of(resource));

        ResponseEntity<String> result = controller.rssFeed();

        assertThat(result.getBody()).contains("<title>Intro</title>");
        assertThat(result.getBody()).contains("http://localhost:5173/resources/intro");
        assertThat(result.getBody()).doesNotContain("http://localhost:5173//resources");
    }

    @Test
    void atomFeedContainsResource() {
        when(resourceRepository.findTop20ByOrderByCreatedAtDesc()).thenReturn(List.of(resource));

        ResponseEntity<String> result = controller.atomFeed();

        assertThat(result.getBody()).contains("<title>Intro</title>");
        assertThat(result.getBody()).contains("http://localhost:5173/resources/intro");
    }
}
