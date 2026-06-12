package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
/**
 * Service for managing discussion threads in resources and channels.
 */
public class ThreadService {

    private static final Logger log = LoggerFactory.getLogger(ThreadService.class);

    private final ResourcePostRepository resourcePostRepository;
    private final ResourceThreadRepository resourceThreadRepository;
    private final ChannelThreadRepository channelThreadRepository;
    private final ChannelPostRepository channelPostRepository;
    private final ChannelRepository channelRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ThreadService(ResourcePostRepository resourcePostRepository,
                         ResourceThreadRepository resourceThreadRepository,
                         ChannelThreadRepository channelThreadRepository,
                         ChannelPostRepository channelPostRepository,
                         ChannelRepository channelRepository,
                         SimpMessagingTemplate messagingTemplate) {
        this.resourcePostRepository = resourcePostRepository;
        this.resourceThreadRepository = resourceThreadRepository;
        this.channelThreadRepository = channelThreadRepository;
        this.channelPostRepository = channelPostRepository;
        this.channelRepository = channelRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public PostResponse createResourcePost(Long threadId, CreatePostRequest request, User user) {
        ResourceThread thread = resourceThreadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Resource thread not found"));

        ResourcePost post = ResourcePost.builder()
                .thread(thread)
                .user(user)
                .content(request.content())
                .build();

        post = resourcePostRepository.save(post);

        PostResponse response = new PostResponse(
                post.getId(),
                threadId,
                user.getId(),
                user.getName(),
                post.getContent(),
                post.getCreatedAt()
        );

        // Push the new post to anyone subscribed to this thread
        log.debug("Broadcasting post to /topic/thread/{}", threadId);
        messagingTemplate.convertAndSend("/topic/thread/" + threadId, response);

        return response;
    }

    @Transactional
    public ChannelThreadResponse createChannelThread(Long channelId, CreateChannelThreadRequest request, User user) {
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        ChannelThread thread = ChannelThread.builder()
                .channel(channel)
                .title(request.title())
                .user(user)
                .build();

        thread = channelThreadRepository.save(thread);

        // Auto-create the first post from the thread creation request content
        ChannelPost firstPost = ChannelPost.builder()
                .thread(thread)
                .user(user)
                .content(request.content())
                .build();
        channelPostRepository.save(firstPost);

        return new ChannelThreadResponse(
                thread.getId(),
                channelId,
                thread.getTitle(),
                user.getId(),
                user.getName(),
                1,
                thread.getCreatedAt()
        );
    }

    @Transactional
    public PostResponse createChannelPost(Long threadId, CreatePostRequest request, User user) {
        ChannelThread thread = channelThreadRepository.findById(threadId)
                .orElseThrow(() -> new IllegalArgumentException("Channel thread not found"));

        ChannelPost post = ChannelPost.builder()
                .thread(thread)
                .user(user)
                .content(request.content())
                .build();

        post = channelPostRepository.save(post);

        PostResponse response = new PostResponse(
                post.getId(),
                threadId,
                user.getId(),
                user.getName(),
                post.getContent(),
                post.getCreatedAt()
        );

        // Broadcast new post to all subscribers of this channel thread
        messagingTemplate.convertAndSend("/topic/channel-thread/" + threadId, response);

        return response;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getResourcePosts(Long threadId, Pageable pageable) {
        return resourcePostRepository.findByThreadIdOrderByCreatedAtAsc(threadId, pageable)
                .map(p -> new PostResponse(
                        p.getId(),
                        p.getThread().getId(),
                        p.getUser().getId(),
                        p.getUser().getName(),
                        p.getContent(),
                        p.getCreatedAt()
                ));
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> getChannelPosts(Long threadId, Pageable pageable) {
        return channelPostRepository.findByThreadIdOrderByCreatedAtAsc(threadId, pageable)
                .map(p -> new PostResponse(
                        p.getId(),
                        p.getThread().getId(),
                        p.getUser().getId(),
                        p.getUser().getName(),
                        p.getContent(),
                        p.getCreatedAt()
                ));
    }

    @Transactional
    public void deletePost(Long postId, String type, User currentUser) {
        if (!isAdminOrModerator(currentUser)) {
            throw new IllegalArgumentException("Only admins and moderators can delete posts");
        }

        // Route deletion to the correct repository based on post type
        if ("resource".equalsIgnoreCase(type)) {
            resourcePostRepository.deleteById(postId);
        } else if ("channel".equalsIgnoreCase(type)) {
            channelPostRepository.deleteById(postId);
        } else {
            throw new IllegalArgumentException("Invalid post type: " + type);
        }
    }

    private boolean isAdminOrModerator(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR;
    }
}
