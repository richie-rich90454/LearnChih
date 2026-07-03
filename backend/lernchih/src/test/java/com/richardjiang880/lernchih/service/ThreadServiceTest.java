package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.model.enums.ContentFormat;
import com.richardjiang880.lernchih.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ThreadServiceTest {

    @Mock
    private ResourcePostRepository resourcePostRepository;
    @Mock
    private ResourceThreadRepository resourceThreadRepository;
    @Mock
    private ChannelThreadRepository channelThreadRepository;
    @Mock
    private ChannelPostRepository channelPostRepository;
    @Mock
    private ChannelRepository channelRepository;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private ContentSanitizer contentSanitizer;

    @InjectMocks
    private ThreadService threadService;

    @Test
    void createResourcePostSavesAndBroadcasts() {
        User user = User.builder().id(1L).name("Alice").build();
        ResourceThread thread = ResourceThread.builder().id(10L).build();
        ResourcePost post = ResourcePost.builder().id(100L).thread(thread).user(user).content("Hello").build();
        when(resourceThreadRepository.findById(10L)).thenReturn(Optional.of(thread));
        when(contentSanitizer.sanitizePlain("Hello")).thenReturn("Hello");
        when(resourcePostRepository.save(any(ResourcePost.class))).thenReturn(post);

        PostResponse response = threadService.createResourcePost(10L, new CreatePostRequest("Hello", ContentFormat.PLAIN), user);

        assertThat(response.content()).isEqualTo("Hello");
        assertThat(response.userId()).isEqualTo(1L);
        verify(messagingTemplate).convertAndSend("/topic/thread/10", response);
    }

    @Test
    void createResourcePostThrowsWhenThreadMissing() {
        when(resourceThreadRepository.findById(10L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> threadService.createResourcePost(10L, new CreatePostRequest("Hello", null), User.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Resource thread not found");
    }

    @Test
    void createChannelThreadSavesThreadAndFirstPost() {
        User user = User.builder().id(1L).name("Alice").build();
        Channel channel = Channel.builder().id(5L).build();
        ChannelThread thread = ChannelThread.builder().id(20L).channel(channel).title("Title").user(user).build();
        when(channelRepository.findById(5L)).thenReturn(Optional.of(channel));
        when(contentSanitizer.sanitizePlain("Title")).thenReturn("Title");
        when(contentSanitizer.sanitizePlain("Body")).thenReturn("Body");
        when(channelThreadRepository.save(any(ChannelThread.class))).thenReturn(thread);
        when(channelPostRepository.save(any(ChannelPost.class))).thenAnswer(inv -> inv.getArgument(0));

        ChannelThreadResponse response = threadService.createChannelThread(5L,
                new CreateChannelThreadRequest("Title", "Body", ContentFormat.MARKDOWN), user);

        assertThat(response.channelId()).isEqualTo(5L);
        assertThat(response.title()).isEqualTo("Title");
        assertThat(response.postCount()).isEqualTo(1);
        verify(channelPostRepository).save(any(ChannelPost.class));
    }

    @Test
    void createChannelPostSavesAndBroadcasts() {
        User user = User.builder().id(1L).name("Alice").build();
        ChannelThread thread = ChannelThread.builder().id(30L).build();
        ChannelPost post = ChannelPost.builder().id(200L).thread(thread).user(user).content("Reply").build();
        when(channelThreadRepository.findById(30L)).thenReturn(Optional.of(thread));
        when(contentSanitizer.sanitizePlain("Reply")).thenReturn("Reply");
        when(channelPostRepository.save(any(ChannelPost.class))).thenReturn(post);

        PostResponse response = threadService.createChannelPost(30L, new CreatePostRequest("Reply", null), user);

        assertThat(response.content()).isEqualTo("Reply");
        verify(messagingTemplate).convertAndSend("/topic/channel-thread/30", response);
    }

    @Test
    void getResourcePostsMapsPage() {
        Pageable pageable = PageRequest.of(0, 10);
        User user = User.builder().id(1L).name("Alice").build();
        ResourceThread thread = ResourceThread.builder().id(10L).build();
        ResourcePost post = ResourcePost.builder().id(1L).thread(thread).user(user).content("Hi").build();
        when(resourcePostRepository.findByThreadIdOrderByCreatedAtAsc(10L, pageable))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostResponse> result = threadService.getResourcePosts(10L, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).content()).isEqualTo("Hi");
    }

    @Test
    void getChannelPostsMapsPage() {
        Pageable pageable = PageRequest.of(0, 10);
        User user = User.builder().id(1L).name("Alice").build();
        ChannelThread thread = ChannelThread.builder().id(10L).build();
        ChannelPost post = ChannelPost.builder().id(1L).thread(thread).user(user).content("Hi").build();
        when(channelPostRepository.findByThreadIdOrderByCreatedAtAsc(10L, pageable))
                .thenReturn(new PageImpl<>(List.of(post)));

        Page<PostResponse> result = threadService.getChannelPosts(10L, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).content()).isEqualTo("Hi");
    }

    @Test
    void deletePostAllowsAdminForResourcePost() {
        User admin = User.builder().id(1L).role(Role.ADMIN).build();

        threadService.deletePost(1L, "resource", admin);

        verify(resourcePostRepository).deleteById(1L);
    }

    @Test
    void deletePostAllowsModeratorForChannelPost() {
        User moderator = User.builder().id(1L).role(Role.MODERATOR).build();

        threadService.deletePost(2L, "channel", moderator);

        verify(channelPostRepository).deleteById(2L);
    }

    @Test
    void deletePostRejectsStudent() {
        User student = User.builder().id(1L).role(Role.STUDENT).build();

        assertThatThrownBy(() -> threadService.deletePost(1L, "resource", student))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only admins and moderators");
    }

    @Test
    void deletePostThrowsForInvalidType() {
        User admin = User.builder().id(1L).role(Role.ADMIN).build();

        assertThatThrownBy(() -> threadService.deletePost(1L, "unknown", admin))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid post type");
    }
}
