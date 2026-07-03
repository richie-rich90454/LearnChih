package com.richardjiang880.lernchih.config;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UrlNormalizationFilterTest {

    @Mock
    private FilterChain filterChain;

    @Test
    void disabledFilterPassesThrough() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(false, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/some-Path/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void stripsTrailingSlash() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/hello/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(301);
        assertThat(response.getHeader("Location")).isEqualTo("/hello");
    }

    @Test
    void lowercasesPath() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/HELLO");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(301);
        assertThat(response.getHeader("Location")).isEqualTo("/hello");
    }

    @Test
    void enforcesCanonicalHost() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "example.com");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/hello");
        request.addHeader("Host", "old.com");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(301);
        assertThat(response.getHeader("Location")).startsWith("http://example.com/hello");
    }

    @Test
    void preservesQueryString() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/hello/");
        request.setQueryString("page=2");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getHeader("Location")).isEqualTo("/hello?page=2");
    }

    @Test
    void skipsApiPaths() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/resources/");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void skipsStaticExtensions() throws Exception {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/logo.PNG");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void registrationBeanConfiguredForAllUrls() {
        UrlNormalizationFilter filter = new UrlNormalizationFilter(true, "");
        FilterRegistrationBean<UrlNormalizationFilter> registration = filter.urlNormalizationFilterRegistration(filter);

        assertThat(registration.getFilter()).isSameAs(filter);
        assertThat(registration.getOrder()).isEqualTo(org.springframework.core.Ordered.LOWEST_PRECEDENCE - 1);
        assertThat(registration.getUrlPatterns()).containsExactly("/*");
    }
}
