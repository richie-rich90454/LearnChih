package com.richardjiang880.lernchih.util;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SlugUtilTest {

    @Test
    void slugifyReturnsLowercasedAlphanumericWordsJoinedByHyphens() {
        assertThat(SlugUtil.slugify("Hello World")).isEqualTo("hello-world");
    }

    @Test
    void slugifyTrimsLeadingAndTrailingNonAlphanumericCharacters() {
        assertThat(SlugUtil.slugify("!!!Hello World!!!")).isEqualTo("hello-world");
    }

    @Test
    void slugifyCollapsesConsecutiveNonAlphanumericCharacters() {
        assertThat(SlugUtil.slugify("Hello---World__Test")).isEqualTo("hello-world-test");
    }

    @Test
    void slugifyHandlesNullInput() {
        assertThat(SlugUtil.slugify(null)).isEqualTo(SlugUtil.DEFAULT_SLUG);
    }

    @Test
    void slugifyHandlesBlankInput() {
        assertThat(SlugUtil.slugify("   ")).isEqualTo(SlugUtil.DEFAULT_SLUG);
    }

    @Test
    void slugifyHandlesInputThatProducesEmptySlug() {
        assertThat(SlugUtil.slugify("!!!")).isEqualTo(SlugUtil.DEFAULT_SLUG);
    }

    @Test
    void slugifyPreservesNumbers() {
        assertThat(SlugUtil.slugify("Lesson 101: Introduction")).isEqualTo("lesson-101-introduction");
    }
}
