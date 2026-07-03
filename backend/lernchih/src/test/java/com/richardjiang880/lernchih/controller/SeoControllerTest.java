package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.service.SeoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeoControllerTest {

    @Mock
    private SeoService seoService;

    private SeoController controller;

    @BeforeEach
    void setUp() {
        controller = new SeoController(seoService);
    }

    @Test
    void robotsTxtReturnsServiceOutput() {
        when(seoService.robotsTxt()).thenReturn("User-agent: *\nAllow: /");
        assertThat(controller.robots()).isEqualTo("User-agent: *\nAllow: /");
    }

    @Test
    void sitemapIndexReturnsServiceOutput() {
        when(seoService.sitemapIndex()).thenReturn("<sitemapindex/>");
        assertThat(controller.sitemapIndex()).isEqualTo("<sitemapindex/>");
    }

    @Test
    void sitemapResourcesReturnsServiceOutput() {
        when(seoService.sitemapResources()).thenReturn("<urlset/>");
        assertThat(controller.sitemapResources()).isEqualTo("<urlset/>");
    }

    @Test
    void sitemapChannelsReturnsServiceOutput() {
        when(seoService.sitemapChannels()).thenReturn("<urlset/>");
        assertThat(controller.sitemapChannels()).isEqualTo("<urlset/>");
    }

    @Test
    void sitemapStaticReturnsServiceOutput() {
        when(seoService.sitemapStatic()).thenReturn("<urlset/>");
        assertThat(controller.sitemapStatic()).isEqualTo("<urlset/>");
    }
}
