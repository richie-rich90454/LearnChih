package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.Test;
import org.springframework.context.MessageSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.servlet.LocaleResolver;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

class LocaleConfigTest {

    private final LocaleConfig config = new LocaleConfig();

    @Test
    void messageSourceConfiguredForMessagesBundle() {
        MessageSource source = config.messageSource();

        assertThat(source.getMessage("error.badrequest", null, Locale.ENGLISH)).isNotNull();
    }

    @Test
    void localeResolverSupportsEnglishAndChinese() {
        LocaleResolver resolver = config.localeResolver();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addPreferredLocale(Locale.ENGLISH);

        assertThat(resolver.resolveLocale(request)).isEqualTo(Locale.ENGLISH);

        request.addPreferredLocale(Locale.SIMPLIFIED_CHINESE);
        assertThat(resolver.resolveLocale(request)).isEqualTo(Locale.SIMPLIFIED_CHINESE);
    }
}
