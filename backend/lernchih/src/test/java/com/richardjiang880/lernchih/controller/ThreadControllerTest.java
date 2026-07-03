package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CreatePostRequest;
import com.richardjiang880.lernchih.dto.PostResponse;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.ContentFormat;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ThreadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThreadControllerTest {

    @Mock
    private ThreadService threadService;
    @Mock
    private UserRepository userRepository;

    private ThreadController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new ThreadController(threadService, userRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void createResourcePostDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        CreatePostRequest request = new CreatePostRequest("content", ContentFormat.PLAIN);
        PostResponse response = new PostResponse(5L, 10L, 1L, "Alice", "content", null);
        when(threadService.createResourcePost(10L, request, user)).thenReturn(response);

        ResponseEntity<PostResponse> result = controller.createResourcePost(userDetails(), 10L, request);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void getResourcePostsDelegatesToService() {
        Pageable pageable = PageRequest.of(0, 50);
        PostResponse response = new PostResponse(5L, 10L, 1L, "Alice", "content", null);
        when(threadService.getResourcePosts(10L, pageable)).thenReturn(new PageImpl<>(List.of(response)));

        ResponseEntity<Page<PostResponse>> result = controller.getResourcePosts(10L, pageable);

        assertThat(result.getBody().getContent()).hasSize(1);
    }
}
