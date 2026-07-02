package com.richardjiang880.lernchih.util;

/**
 * Slug generation utility for SEO-friendly URL segments.
 *
 * <p>Converts an arbitrary text (e.g. a resource title or channel name) into a
 * URL-safe slug: lowercased, non-alphanumeric characters replaced with hyphens,
 * consecutive hyphens collapsed, and leading/trailing hyphens trimmed.
 *
 * <p>Null or blank input falls back to {@code "resource"} so the resulting slug
 * is always non-empty and safe for a NOT NULL column.
 */
public final class SlugUtil {

    /** Fallback slug used when the source text is null or blank. */
    public static final String DEFAULT_SLUG = "resource";

    private SlugUtil() {
    }

    /**
     * Slugify the given text. Returns {@link #DEFAULT_SLUG} when the input is
     * null/blank or produces an empty slug.
     */
    public static String slugify(String text) {
        if (text == null || text.isBlank()) {
            return DEFAULT_SLUG;
        }
        String slug = text.toLowerCase();
        // Replace every run of non-alphanumeric characters with a single hyphen.
        slug = slug.replaceAll("[^a-z0-9]+", "-");
        // Trim leading/trailing hyphens.
        slug = slug.replaceAll("^-+|-+$", "");
        if (slug.isEmpty()) {
            return DEFAULT_SLUG;
        }
        return slug;
    }
}
