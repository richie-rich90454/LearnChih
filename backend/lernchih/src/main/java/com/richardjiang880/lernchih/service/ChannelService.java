package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ChannelResponse;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
/**
 * Service for reading channels. Channels are read-only reference data, which
 * makes them a good fit for caching the single-channel GET endpoint.
 */
public class ChannelService {

    private final ChannelRepository channelRepository;

    public ChannelService(ChannelRepository channelRepository) {
        this.channelRepository = channelRepository;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "channels", key = "#idOrSlug")
    public ChannelResponse getChannel(String idOrSlug) {
        Channel channel = resolveChannel(idOrSlug);
        return new ChannelResponse(
                channel.getId(),
                channel.getSlug(),
                channel.getName(),
                channel.getDescription(),
                channel.getThreads().size(),
                channel.getCreatedAt()
        );
    }

    // Numeric segments resolve by id; anything else is treated as a slug.
    private Channel resolveChannel(String id) {
        if (id != null && id.matches("\\d+")) {
            return channelRepository.findById(Long.parseLong(id))
                    .orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        }
        return channelRepository.findBySlug(id)
                .orElseThrow(() -> new IllegalArgumentException("Channel not found"));
    }
}
