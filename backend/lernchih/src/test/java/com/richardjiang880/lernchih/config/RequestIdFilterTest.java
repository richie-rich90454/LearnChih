package com.richardjiang880.lernchih.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class RequestIdFilterTest {

    private final RequestIdFilter filter = new RequestIdFilter();

    @Mock
    private FilterChain filterChain;

    @Test
    void generatesRequestIdWhenHeaderMissing() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        String requestId = response.getHeader(RequestIdFilter.REQUEST_ID_HEADER);
        assertThat(requestId).isNotBlank();
    }

    @Test
    void echoesIncomingRequestIdHeader() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader(RequestIdFilter.REQUEST_ID_HEADER, "existing-id");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(response.getHeader(RequestIdFilter.REQUEST_ID_HEADER)).isEqualTo("existing-id");
    }

    @Test
    void registrationBeanConfiguredForAllUrls() {
        FilterRegistrationBean<RequestIdFilter> registration = filter.requestIdFilterRegistration(filter);

        assertThat(registration.getFilter()).isSameAs(filter);
        assertThat(registration.getOrder()).isEqualTo(org.springframework.core.Ordered.HIGHEST_PRECEDENCE);
        assertThat(registration.getUrlPatterns()).containsExactly("/*");
    }
}
