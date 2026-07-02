package com.richardjiang880.lernchih.service;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Service;

/**
 * Sanitizes user-supplied text before it is persisted.
 *
 * <ul>
 *   <li>{@link #sanitize(String)} — for rich-text fields that may contain a
 *       safe subset of HTML (paragraphs, emphasis, links, images, tables,
 *       code, headings, lists). Everything else is stripped.</li>
 *   <li>{@link #sanitizePlain(String)} — for plain-text fields (titles, names)
 *       that must never contain markup; HTML-special characters are escaped.</li>
 * </ul>
 */
@Service
public class ContentSanitizer {

    // Allows a safe subset of tags/attributes. Any tag/attribute not listed
    // here is removed by the OWASP HtmlSanitizer.
    private static final PolicyFactory RICH_POLICY = new HtmlPolicyBuilder()
            .allowElements(
                    "p", "br", "strong", "em", "ul", "ol", "li",
                    "code", "pre", "blockquote",
                    "h1", "h2", "h3",
                    "table", "thead", "tbody", "tr", "td", "th",
                    "a", "img")
            .allowAttributes("href").onElements("a")
            .allowAttributes("src", "alt", "width", "height").onElements("img")
            .allowStandardUrlProtocols()
            .toFactory();

    /**
     * Sanitize rich-text HTML, keeping only the safe subset of tags.
     *
     * @return the sanitized HTML, or {@code null} if the input is {@code null}.
     */
    public String sanitize(String html) {
        if (html == null) {
            return null;
        }
        return RICH_POLICY.sanitize(html);
    }

    /**
     * Escape HTML-special characters for plain-text fields (titles, names).
     *
     * @return the escaped text, or {@code null} if the input is {@code null}.
     */
    public String sanitizePlain(String text) {
        if (text == null) {
            return null;
        }
        // Order matters: escape '&' first so it doesn't double-encode later.
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#39;");
    }
}
