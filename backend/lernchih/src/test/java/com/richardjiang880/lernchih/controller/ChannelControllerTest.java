package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.ChannelThread;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.ContentFormat;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ChannelThreadRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ChannelService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChannelControllerTest {

    @Mock
    private ChannelRepository channelRepository;
    @Mock
    private ChannelThreadRepository channelThreadRepository;
    @Mock
    private ThreadService threadService;
    @Mock
    private ChannelService channelService;
    @Mock
    private UserRepository userRepository;

    private ChannelController controller;
    private User user;
    private Channel channel;

    @BeforeEach
    void setUp() {
        controller = new ChannelController(channelRepository, channelThreadRepository, threadService, channelService, userRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
        channel = Channel.builder().name("Java").slug("java").description("Java channel").build();
        channel.setId(10L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void getChannelsReturnsList() {
        when(channelRepository.findAll()).thenReturn(List.of(channel));

        ResponseEntity<List<ChannelResponse>> result = controller.getChannels();

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).hasSize(1);
        assertThat(result.getBody().get(0).name()).isEqualTo("Java");
    }

    @Test
    void getChannelByIdOrSlug() {
        ChannelResponse response = new ChannelResponse(10L, "java", "Java", "Java channel", 0, null);
        when(channelService.getChannel("java")).thenReturn(response);

        ResponseEntity<ChannelResponse> result = controller.getChannel("java");

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void getChannelThreadsReturnsPage() {
        ChannelThread thread = ChannelThread.builder().channel(channel).title("Intro").user(user).content("hello").format(ContentFormat.PLAIN).build();
        thread.setId(20L);
        Pageable pageable = PageRequest.of(0, 20);
        when(channelRepository.findById(10L)).thenReturn(Optional.of(channel));
        when(channelRepository.existsById(10L)).thenReturn(true);
        when(channelThreadRepository.findByChannelIdOrderByCreatedAtDesc(10L, pageable))
                .thenReturn(new PageImpl<>(List.of(thread)));

        ResponseEntity<Page<ChannelThreadResponse>> result = controller.getChannelThreads("10", pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().getContent()).hasSize(1);
    }

    @Test
    void getChannelThreadsResolvesSlug() {
        ChannelThread thread = ChannelThread.builder().channel(channel).title("Intro").user(user).content("hello").format(ContentFormat.PLAIN).build();
        thread.setId(20L);
        Pageable pageable = PageRequest.of(0, 20);
        when(channelRepository.findBySlug("java")).thenReturn(Optional.of(channel));
        when(channelRepository.existsById(10L)).thenReturn(true);
        when(channelThreadRepository.findByChannelIdOrderByCreatedAtDesc(10L, pageable))
                .thenReturn(new PageImpl<>(List.of(thread)));

        ResponseEntity<Page<ChannelThreadResponse>> result = controller.getChannelThreads("java", pageable);

        assertThat(result.getBody().getContent()).hasSize(1);
    }

    @Test
    void createChannelThreadDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        CreateChannelThreadRequest request = new CreateChannelThreadRequest("Title", "Body", ContentFormat.PLAIN);
        ChannelThreadResponse response = new ChannelThreadResponse(20L, 10L, "Title", 1L, "Alice", 0, null);
        when(threadService.createChannelThread(10L, request, user)).thenReturn(response);

        ResponseEntity<ChannelThreadResponse> result = controller.createChannelThread(userDetails(), 10L, request);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void createChannelPostDelegatesToService() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        CreatePostRequest request = new CreatePostRequest("Body", ContentFormat.PLAIN);
        PostResponse response = new PostResponse(30L, 20L, 1L, "Alice", "Body", null);
        when(threadService.createChannelPost(20L, request, user)).thenReturn(response);

        ResponseEntity<PostResponse> result = controller.createChannelPost(userDetails(), 20L, request);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void getChannelPostsDelegatesToService() {
        Pageable pageable = PageRequest.of(0, 50);
        PostResponse response = new PostResponse(30L, 20L, 1L, "Alice", "Body", null);
        when(threadService.getChannelPosts(20L, pageable)).thenReturn(new PageImpl<>(List.of(response)));

        ResponseEntity<Page<PostResponse>> result = controller.getChannelPosts(20L, pageable);

        assertThat(result.getBody().getContent()).hasSize(1);
    }
}
