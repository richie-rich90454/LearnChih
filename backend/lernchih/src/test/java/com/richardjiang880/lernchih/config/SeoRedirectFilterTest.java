package com.richardjiang880.lernchih.config;

import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeoRedirectFilterTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ChannelRepository channelRepository;

    @Mock
    private FilterChain filterChain;

    @Test
    void redirectsNumericResourceIdToSlug() throws Exception {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        when(resourceRepository.findById(42L)).thenReturn(Optional.of(Resource.builder().id(42L).slug("hello-world").build()));
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/resources/42");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(301);
        assertThat(response.getHeader("Location")).isEqualTo("/resources/hello-world");
    }

    @Test
    void redirectsNumericChannelIdToSlug() throws Exception {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        when(channelRepository.findById(7L)).thenReturn(Optional.of(Channel.builder().id(7L).slug("math").build()));
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/channels/7");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(301);
        assertThat(response.getHeader("Location")).isEqualTo("/channels/math");
    }

    @Test
    void passesThroughWhenNoNumericId() throws Exception {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/resources/hello-world");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getStatus()).isEqualTo(200);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void passesThroughApiPaths() throws Exception {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/resources/42");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void passesThroughNonGetMethods() throws Exception {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/resources/42");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void registrationBeanConfiguredForAllUrls() {
        SeoRedirectFilter filter = new SeoRedirectFilter(resourceRepository, channelRepository);
        FilterRegistrationBean<SeoRedirectFilter> registration = filter.seoRedirectFilterRegistration(filter);

        assertThat(registration.getFilter()).isSameAs(filter);
        assertThat(registration.getOrder()).isEqualTo(org.springframework.core.Ordered.LOWEST_PRECEDENCE);
        assertThat(registration.getUrlPatterns()).containsExactly("/*");
    }
}
