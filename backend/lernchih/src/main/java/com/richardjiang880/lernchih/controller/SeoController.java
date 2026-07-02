package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.service.SeoService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves crawlable SEO endpoints: {@code /robots.txt} and the sitemap family
 * ({@code /sitemap.xml} index plus the resource, channel and static leaf
 * sitemaps). All endpoints are public (permitted in {@code SecurityConfig}).
 */
@RestController
public class SeoController {

    private final SeoService seoService;

    public SeoController(SeoService seoService) {
        this.seoService = seoService;
    }

    @GetMapping(value = "/robots.txt", produces = MediaType.TEXT_PLAIN_VALUE)
    public String robots() {
        return seoService.robotsTxt();
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemapIndex() {
        return seoService.sitemapIndex();
    }

    @GetMapping(value = "/sitemap-resources.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemapResources() {
        return seoService.sitemapResources();
    }

    @GetMapping(value = "/sitemap-channels.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemapChannels() {
        return seoService.sitemapChannels();
    }

    @GetMapping(value = "/sitemap-static.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemapStatic() {
        return seoService.sitemapStatic();
    }
}
