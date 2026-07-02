package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Builds SEO artifacts (robots.txt and the sitemap family) from the
 * configurable public base URL and the live resource/channel tables.
 *
 * <p>XML is assembled manually with a {@link StringBuilder}; all dynamic
 * values are escaped so the output is always well-formed.
 */
@Service
public class SeoService {

    /** Upper bound on the number of resource entries emitted per sitemap. */
    private static final int RESOURCE_LIMIT = 5000;

    private static final String SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
    private static final String XML_DECL = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";

    private final ResourceRepository resourceRepository;
    private final ChannelRepository channelRepository;
    private final String baseUrl;

    public SeoService(ResourceRepository resourceRepository,
                      ChannelRepository channelRepository,
                      @Value("${app.seo.base-url:http://localhost:5173}") String baseUrl) {
        this.resourceRepository = resourceRepository;
        this.channelRepository = channelRepository;
        // Normalize: strip a single trailing slash so URLs never contain "//".
        if (baseUrl != null && baseUrl.endsWith("/")) {
            this.baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        } else {
            this.baseUrl = baseUrl;
        }
    }

    /** robots.txt body telling crawlers to stay off API/auth paths. */
    public String robotsTxt() {
        return "User-agent: *\n"
                + "Disallow: /api/\n"
                + "Disallow: /admin\n"
                + "Disallow: /login\n"
                + "Disallow: /register\n"
                + "Disallow: /profile\n"
                + "Allow: /\n"
                + "Sitemap: " + baseUrl + "/sitemap.xml\n";
    }

    /** Sitemap index referencing the resource, channel and static sitemaps. */
    public String sitemapIndex() {
        StringBuilder sb = new StringBuilder();
        sb.append(XML_DECL);
        sb.append("<sitemapindex xmlns=\"").append(SITEMAP_NS).append("\">\n");
        appendSitemapEntry(sb, baseUrl + "/sitemap-resources.xml");
        appendSitemapEntry(sb, baseUrl + "/sitemap-channels.xml");
        appendSitemapEntry(sb, baseUrl + "/sitemap-static.xml");
        sb.append("</sitemapindex>\n");
        return sb.toString();
    }

    /** Sitemap of public resource pages, keyed by slug and dated via updatedAt. */
    public String sitemapResources() {
        List<Resource> resources = resourceRepository
                .findAll(PageRequest.of(0, RESOURCE_LIMIT)).getContent();
        StringBuilder sb = new StringBuilder();
        sb.append(XML_DECL);
        sb.append("<urlset xmlns=\"").append(SITEMAP_NS).append("\">\n");
        for (Resource r : resources) {
            appendUrlEntry(sb, baseUrl + "/resources/" + r.getSlug(), r.getUpdatedAt());
        }
        sb.append("</urlset>\n");
        return sb.toString();
    }

    /** Sitemap of public channel pages, keyed by slug and dated via createdAt. */
    public String sitemapChannels() {
        List<Channel> channels = channelRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append(XML_DECL);
        sb.append("<urlset xmlns=\"").append(SITEMAP_NS).append("\">\n");
        for (Channel c : channels) {
            appendUrlEntry(sb, baseUrl + "/channels/" + c.getSlug(), c.getCreatedAt());
        }
        sb.append("</urlset>\n");
        return sb.toString();
    }

    /** Sitemap of the stable static SPA routes. */
    public String sitemapStatic() {
        String[] paths = {"/", "/resources", "/channels", "/leaderboard", "/login", "/register"};
        StringBuilder sb = new StringBuilder();
        sb.append(XML_DECL);
        sb.append("<urlset xmlns=\"").append(SITEMAP_NS).append("\">\n");
        for (String path : paths) {
            appendUrlEntry(sb, baseUrl + path, null);
        }
        sb.append("</urlset>\n");
        return sb.toString();
    }

    private void appendSitemapEntry(StringBuilder sb, String loc) {
        sb.append("  <sitemap>\n");
        sb.append("    <loc>").append(escape(loc)).append("</loc>\n");
        sb.append("  </sitemap>\n");
    }

    private void appendUrlEntry(StringBuilder sb, String loc, LocalDateTime lastmod) {
        sb.append("  <url>\n");
        sb.append("    <loc>").append(escape(loc)).append("</loc>\n");
        if (lastmod != null) {
            // W3C Datetime (date precision) as allowed by the sitemap spec.
            sb.append("    <lastmod>").append(lastmod.toLocalDate().toString()).append("</lastmod>\n");
        }
        sb.append("  </url>\n");
    }

    /** Escapes XML special characters in text/attribute content. */
    private String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
