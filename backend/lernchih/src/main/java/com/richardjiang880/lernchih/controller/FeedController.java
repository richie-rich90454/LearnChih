package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/feeds")
public class FeedController {

    private static final DateTimeFormatter RFC_1123 = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm:ss 'GMT'");
    private static final DateTimeFormatter ATOM_DATE = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    private final ResourceRepository resourceRepository;
    private final String baseUrl;

    public FeedController(ResourceRepository resourceRepository,
                          @Value("${app.seo.base-url}") String baseUrl) {
        this.resourceRepository = resourceRepository;
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
    }

    @Transactional(readOnly = true)
    @GetMapping(value = "/rss", produces = MediaType.APPLICATION_RSS_XML_VALUE)
    public ResponseEntity<String> rssFeed() {
        List<Resource> resources = resourceRepository.findTop20ByOrderByCreatedAtDesc();
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<rss version=\"2.0\">\n");
        sb.append("<channel>\n");
        sb.append("<title>LernChih Resources</title>\n");
        sb.append("<link>").append(escapeXml(baseUrl)).append("</link>\n");
        sb.append("<description>Latest educational resources shared on LernChih</description>\n");
        sb.append("<language>en-us</language>\n");
        sb.append("<lastBuildDate>").append(formatRssDate(LocalDateTime.now())).append("</lastBuildDate>\n");

        for (Resource resource : resources) {
            String resourceUrl = baseUrl + "/resources/" + resource.getSlug();
            sb.append("<item>\n");
            sb.append("<title>").append(escapeXml(resource.getTitle())).append("</title>\n");
            sb.append("<link>").append(escapeXml(resourceUrl)).append("</link>\n");
            sb.append("<description>").append(escapeXml(resource.getDescription())).append("</description>\n");
            sb.append("<author>").append(escapeXml(resource.getUser().getEmail())).append("</author>\n");
            sb.append("<pubDate>").append(formatRssDate(resource.getCreatedAt())).append("</pubDate>\n");
            sb.append("<guid>").append(escapeXml(resourceUrl)).append("</guid>\n");
            sb.append("</item>\n");
        }

        sb.append("</channel>\n");
        sb.append("</rss>");
        return ResponseEntity.ok(sb.toString());
    }

    @Transactional(readOnly = true)
    @GetMapping(value = "/atom", produces = MediaType.APPLICATION_ATOM_XML_VALUE)
    public ResponseEntity<String> atomFeed() {
        List<Resource> resources = resourceRepository.findTop20ByOrderByCreatedAtDesc();
        String feedUrl = baseUrl + "/api/feeds/atom";
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        sb.append("<feed xmlns=\"http://www.w3.org/2005/Atom\">\n");
        sb.append("<title>LernChih Resources</title>\n");
        sb.append("<link href=\"").append(escapeXml(feedUrl)).append("\"/>\n");
        sb.append("<link rel=\"self\" href=\"").append(escapeXml(feedUrl)).append("\"/>\n");
        sb.append("<id>").append(escapeXml(baseUrl)).append("</id>\n");
        sb.append("<updated>").append(formatAtomDate(LocalDateTime.now())).append("</updated>\n");

        for (Resource resource : resources) {
            String resourceUrl = baseUrl + "/resources/" + resource.getSlug();
            sb.append("<entry>\n");
            sb.append("<title>").append(escapeXml(resource.getTitle())).append("</title>\n");
            sb.append("<link href=\"").append(escapeXml(resourceUrl)).append("\"/>\n");
            sb.append("<id>").append(escapeXml(resourceUrl)).append("</id>\n");
            sb.append("<updated>").append(formatAtomDate(resource.getCreatedAt())).append("</updated>\n");
            sb.append("<summary>").append(escapeXml(resource.getDescription())).append("</summary>\n");
            sb.append("<author><name>").append(escapeXml(resource.getUser().getName())).append("</name></author>\n");
            sb.append("</entry>\n");
        }

        sb.append("</feed>");
        return ResponseEntity.ok(sb.toString());
    }

    private String escapeXml(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private String formatRssDate(LocalDateTime dateTime) {
        return dateTime.atOffset(ZoneOffset.UTC).format(RFC_1123);
    }

    private String formatAtomDate(LocalDateTime dateTime) {
        return dateTime.atOffset(ZoneOffset.UTC).format(ATOM_DATE);
    }
}
