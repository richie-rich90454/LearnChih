package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ChannelResponse;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChannelServiceTest {

    @Mock
    private ChannelRepository channelRepository;

    @InjectMocks
    private ChannelService channelService;

    @Test
    void getChannelById() {
        Channel channel = Channel.builder()
                .id(1L)
                .slug("java")
                .name("Java")
                .description("Java discussions")
                .threads(java.util.List.of())
                .build();
        when(channelRepository.findById(1L)).thenReturn(Optional.of(channel));

        ChannelResponse response = channelService.getChannel("1");

        assertThat(response.id()).isEqualTo(1L);
        assertThat(response.slug()).isEqualTo("java");
        assertThat(response.name()).isEqualTo("Java");
        assertThat(response.threadCount()).isZero();
    }

    @Test
    void getChannelBySlug() {
        Channel channel = Channel.builder()
                .id(2L)
                .slug("spring-boot")
                .name("Spring Boot")
                .description("Spring Boot discussions")
                .threads(java.util.List.of())
                .build();
        when(channelRepository.findBySlug("spring-boot")).thenReturn(Optional.of(channel));

        ChannelResponse response = channelService.getChannel("spring-boot");

        assertThat(response.id()).isEqualTo(2L);
        assertThat(response.slug()).isEqualTo("spring-boot");
    }

    @Test
    void getChannelThrowsWhenNotFound() {
        when(channelRepository.findBySlug("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> channelService.getChannel("missing"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Channel not found");
    }
}
