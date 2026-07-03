package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ChannelThreadRepository;
import com.richardjiang880.lernchih.repository.ResourceThreadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ChannelControllerIT extends AbstractControllerIntegrationTest {

    @Autowired
    private ChannelRepository channelRepository;
    @Autowired
    private ChannelThreadRepository channelThreadRepository;
    @Autowired
    private ResourceThreadRepository resourceThreadRepository;

    @BeforeEach
    void cleanUp() {
        channelThreadRepository.deleteAll();
        resourceThreadRepository.deleteAll();
        channelRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getChannelsIsPublic() {
        channelRepository.save(Channel.builder().name("Java").slug("java").description("Java channel").build());

        ResponseEntity<List<ChannelResponse>> response = restTemplate.exchange(
                "/api/channels",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(1);
        assertThat(response.getBody().get(0).slug()).isEqualTo("java");
    }

    @Test
    void getChannelBySlugIsPublic() {
        channelRepository.save(Channel.builder().name("Java").slug("java").description("Java channel").build());

        ResponseEntity<ChannelResponse> response = restTemplate.getForEntity("/api/channels/java", ChannelResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Java");
    }

    @Test
    void createChannelThreadRequiresAuthentication() {
        Channel channel = channelRepository.save(Channel.builder().name("Java").slug("java").build());

        ResponseEntity<String> anonymous = restTemplate.postForEntity(
                "/api/channels/" + channel.getId() + "/threads",
                new CreateChannelThreadRequest("Title", "Body", null),
                String.class);
        assertThat(anonymous.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        ResponseEntity<ChannelThreadResponse> authenticated = restTemplate.exchange(
                "/api/channels/" + channel.getId() + "/threads",
                HttpMethod.POST,
                new HttpEntity<>(new CreateChannelThreadRequest("Title", "Body", null), authHeaders(token)),
                ChannelThreadResponse.class);

        assertThat(authenticated.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authenticated.getBody()).isNotNull();
        assertThat(authenticated.getBody().title()).isEqualTo("Title");
    }

    @Test
    void getChannelThreadsIsPublic() {
        Channel channel = channelRepository.save(Channel.builder().name("Java").slug("java").build());
        User user = createVerifiedUser("alice@example.com", "Alice", Role.STUDENT);
        ChannelThread thread = ChannelThread.builder()
                .channel(channel)
                .title("Thread")
                .content("Body")
                .user(user)
                .build();
        channelThreadRepository.save(thread);

        ResponseEntity<org.springframework.data.domain.Page<ChannelThreadResponse>> response = restTemplate.exchange(
                "/api/channels/java/threads",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContent()).hasSize(1);
    }

    @Test
    void createChannelPostRequiresAuthentication() {
        Channel channel = channelRepository.save(Channel.builder().name("Java").slug("java").build());
        User user = createVerifiedUser("alice@example.com", "Alice", Role.STUDENT);
        ChannelThread thread = channelThreadRepository.save(ChannelThread.builder()
                .channel(channel)
                .title("Thread")
                .content("Body")
                .user(user)
                .build());

        String token = obtainAccessToken("alice@example.com");
        ResponseEntity<PostResponse> response = restTemplate.exchange(
                "/api/channels/threads/" + thread.getId() + "/posts",
                HttpMethod.POST,
                new HttpEntity<>(new CreatePostRequest("Reply", null), authHeaders(token)),
                PostResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().content()).isEqualTo("Reply");
    }

    @Test
    void getChannelPostsIsPublic() {
        Channel channel = channelRepository.save(Channel.builder().name("Java").slug("java").build());
        User user = createVerifiedUser("alice@example.com", "Alice", Role.STUDENT);
        ChannelThread thread = channelThreadRepository.save(ChannelThread.builder()
                .channel(channel)
                .title("Thread")
                .content("Body")
                .user(user)
                .build());

        ResponseEntity<org.springframework.data.domain.Page<PostResponse>> response = restTemplate.exchange(
                "/api/channels/threads/" + thread.getId() + "/posts",
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }
}
