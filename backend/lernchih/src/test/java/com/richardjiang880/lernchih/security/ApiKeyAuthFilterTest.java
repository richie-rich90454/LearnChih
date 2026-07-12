package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ApiKeyService;
import com.richardjiang880.lernchih.service.ApiKeyRateLimitService;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApiKeyAuthFilterTest {

    @Mock
    private ApiKeyService apiKeyService;

    @Mock
    private ApiKeyRateLimitService rateLimitService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FilterChain filterChain;

    private ApiKeyAuthFilter filter;

    @BeforeEach
    void setUp() {
        filter = new ApiKeyAuthFilter(apiKeyService, rateLimitService, userDetailsService, userRepository);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void validApiKeySetsAuthentication() throws Exception {
        User user = User.builder().id(1L).email("alice@example.com").build();
        ApiKey apiKey = new ApiKey();
        apiKey.setId(10L);
        apiKey.setUserId(1L);
        apiKey.setKeyHash("hash");
        apiKey.setRevoked(false);
        UserDetails details = org.springframework.security.core.userdetails.User
                .withUsername("alice@example.com")
                .password("p")
                .roles("STUDENT")
                .build();

        when(apiKeyService.verifyApiKeyEntity("valid-key")).thenReturn(Optional.of(apiKey));
        when(rateLimitService.checkAndRecord(10L)).thenReturn(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userDetailsService.loadUserByUsername("alice@example.com")).thenReturn(details);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader("X-API-Key", "valid-key");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        verify(apiKeyService).recordUsage("valid-key");
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void missingApiKeyDoesNotSetAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilterInternal(request, response, filterChain);

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void unknownApiKeyUserThrowsIllegalStateException() throws Exception {
        ApiKey orphanKey = new ApiKey();
        orphanKey.setId(99L);
        orphanKey.setUserId(99L);
        orphanKey.setRevoked(false);

        when(apiKeyService.verifyApiKeyEntity("orphan-key")).thenReturn(Optional.of(orphanKey));
        when(rateLimitService.checkAndRecord(99L)).thenReturn(true);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/test");
        request.addHeader("X-API-Key", "orphan-key");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> filter.doFilterInternal(request, response, filterChain))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("unknown user");
    }
}
