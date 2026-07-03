package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeoServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ChannelRepository channelRepository;

    private SeoService seoService(String baseUrl) {
        return new SeoService(resourceRepository, channelRepository, baseUrl);
    }

    @Test
    void robotsTxtContainsDisallowAndSitemapEntries() {
        SeoService service = seoService("http://localhost:5173/");

        String robots = service.robotsTxt();

        assertThat(robots).contains("Disallow: /api/");
        assertThat(robots).contains("Sitemap: http://localhost:5173/sitemap.xml");
    }

    @Test
    void sitemapIndexReferencesSubSitemaps() {
        SeoService service = seoService("http://localhost:5173");

        String index = service.sitemapIndex();

        assertThat(index).contains("<sitemapindex");
        assertThat(index).contains("sitemap-resources.xml");
        assertThat(index).contains("sitemap-channels.xml");
        assertThat(index).contains("sitemap-static.xml");
    }

    @Test
    void sitemapResourcesEmitsResourceUrls() {
        SeoService service = seoService("http://localhost:5173");
        Resource resource = Resource.builder().slug("java-guide").build();
        when(resourceRepository.findAll(PageRequest.of(0, 5000))).thenReturn(new PageImpl<>(List.of(resource)));

        String xml = service.sitemapResources();

        assertThat(xml).contains("/resources/java-guide");
    }

    @Test
    void sitemapChannelsEmitsChannelUrls() {
        SeoService service = seoService("http://localhost:5173");
        Channel channel = Channel.builder().slug("math").build();
        when(channelRepository.findAll()).thenReturn(List.of(channel));

        String xml = service.sitemapChannels();

        assertThat(xml).contains("/channels/math");
    }

    @Test
    void sitemapStaticEmitsStaticRoutes() {
        SeoService service = seoService("http://localhost:5173");

        String xml = service.sitemapStatic();

        assertThat(xml).contains("/resources");
        assertThat(xml).contains("/channels");
        assertThat(xml).contains("/leaderboard");
    }

    @Test
    void baseUrlTrailingSlashIsNormalized() {
        SeoService service = seoService("http://example.com/");

        assertThat(service.robotsTxt()).contains("Sitemap: http://example.com/sitemap.xml");
    }
}
