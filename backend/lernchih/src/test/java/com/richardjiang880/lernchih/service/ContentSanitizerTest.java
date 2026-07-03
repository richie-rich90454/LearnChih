package com.richardjiang880.lernchih.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ContentSanitizerTest {

    private final ContentSanitizer sanitizer = new ContentSanitizer();

    @Test
    void sanitizeReturnsNullForNullInput() {
        assertThat(sanitizer.sanitize(null)).isNull();
    }

    @Test
    void sanitizeKeepsAllowedHtmlTags() {
        String html = "<p>Hello <strong>world</strong></p><a href=\"https://example.com\">link</a>";
        assertThat(sanitizer.sanitize(html))
                .contains("<p>", "<strong>", "</strong>", "</p>", "<a", "href", "</a>");
    }

    @Test
    void sanitizeRemovesDisallowedTags() {
        String html = "<p>Safe</p><script>alert('xss')</script>";
        assertThat(sanitizer.sanitize(html)).doesNotContain("<script>");
    }

    @Test
    void sanitizeRemovesDisallowedAttributes() {
        String html = "<p onclick=\"evil()\">text</p>";
        assertThat(sanitizer.sanitize(html)).doesNotContain("onclick");
    }

    @Test
    void sanitizePlainReturnsNullForNullInput() {
        assertThat(sanitizer.sanitizePlain(null)).isNull();
    }

    @Test
    void sanitizePlainEscapesHtmlSpecialCharacters() {
        String text = "<script>alert('xss')</script>";
        assertThat(sanitizer.sanitizePlain(text))
                .isEqualTo("&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;");
    }

    @Test
    void sanitizePlainEscapesAmpersandsFirst() {
        String text = "A & B < C";
        assertThat(sanitizer.sanitizePlain(text))
                .isEqualTo("A &amp; B &lt; C");
    }
}
