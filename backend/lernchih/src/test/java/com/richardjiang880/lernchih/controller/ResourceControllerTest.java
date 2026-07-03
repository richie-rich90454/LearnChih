package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ResourceCategory;
import com.richardjiang880.lernchih.model.ResourceType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.UpvoteRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.GamificationService;
import com.richardjiang880.lernchih.service.ResourceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    @Mock
    private ResourceService resourceService;
    @Mock
    private GamificationService gamificationService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UpvoteRepository upvoteRepository;
    @Mock
    private ResourceRepository resourceRepository;

    private ResourceController controller;
    private User user;
    private Resource resource;

    @BeforeEach
    void setUp() {
        controller = new ResourceController(resourceService, gamificationService, userRepository, upvoteRepository, resourceRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
        resource = Resource.builder()
                .slug("intro")
                .title("Intro")
                .description("desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .upvoteCount(0)
                .build();
        resource.setId(10L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void createResourceBuildsResponse() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        CreateResourceRequest request = new CreateResourceRequest();
        request.setTitle("Intro");
        request.setDescription("desc");
        request.setCategory(ResourceCategory.ARTICLE);
        request.setType(ResourceType.LINK);
        when(resourceService.createResource(request, null, user)).thenReturn(resource);

        ResponseEntity<ResourceResponse> result = controller.createResource(userDetails(), request, null);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().title()).isEqualTo("Intro");
        assertThat(result.getBody().upvotedByMe()).isFalse();
    }

    @Test
    void getResourcesAnonymous() {
        Pageable pageable = PageRequest.of(0, 20);
        when(resourceService.getResources(pageable, null, null)).thenReturn(new PageImpl<>(List.of(resource)));

        ResponseEntity<Page<ResourceResponse>> result = controller.getResources(pageable, null, null, null);

        assertThat(result.getBody().getContent()).hasSize(1);
        assertThat(result.getBody().getContent().get(0).upvotedByMe()).isFalse();
    }

    @Test
    void getResourcesAuthenticated() {
        Pageable pageable = PageRequest.of(0, 20);
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(resourceService.getResources(pageable, null, null)).thenReturn(new PageImpl<>(List.of(resource)));
        when(upvoteRepository.existsByUserIdAndResourceId(1L, 10L)).thenReturn(true);

        ResponseEntity<Page<ResourceResponse>> result = controller.getResources(pageable, null, null, userDetails());

        assertThat(result.getBody().getContent().get(0).upvotedByMe()).isTrue();
    }

    @Test
    void getResourceDetailById() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        ResourceDetailResponse detail = new ResourceDetailResponse(10L, "intro", "Intro", "desc", "ARTICLE", "LINK", null, null, 1L, "Alice", null, null, 0, false, null, 100L, List.of());
        when(resourceService.getResourceDetail(10L, 1L)).thenReturn(detail);

        ResponseEntity<ResourceDetailResponse> result = controller.getResourceDetail("10", userDetails());

        assertThat(result.getBody()).isEqualTo(detail);
    }

    @Test
    void getResourceDetailBySlug() {
        when(resourceRepository.findBySlug("intro")).thenReturn(Optional.of(resource));
        ResourceDetailResponse detail = new ResourceDetailResponse(10L, "intro", "Intro", "desc", "ARTICLE", "LINK", null, null, 1L, "Alice", null, null, 0, false, null, 100L, List.of());
        when(resourceService.getResourceDetail(10L, null)).thenReturn(detail);

        ResponseEntity<ResourceDetailResponse> result = controller.getResourceDetail("intro", null);

        assertThat(result.getBody()).isEqualTo(detail);
    }

    @Test
    void deleteResourceDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<Void> result = controller.deleteResource(userDetails(), 10L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(resourceService).deleteResource(10L, user);
    }

    @Test
    void toggleUpvoteDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<Void> result = controller.toggleUpvote(userDetails(), 10L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(gamificationService).toggleUpvote(10L, user);
    }

    @Test
    void getLeaderboardDelegatesToService() {
        LeaderboardEntry entry = new LeaderboardEntry(1L, "Alice", "alice@example.com", 100);
        when(gamificationService.getLeaderboard()).thenReturn(List.of(entry));

        ResponseEntity<List<LeaderboardEntry>> result = controller.getLeaderboard();

        assertThat(result.getBody()).containsExactly(entry);
    }
}
