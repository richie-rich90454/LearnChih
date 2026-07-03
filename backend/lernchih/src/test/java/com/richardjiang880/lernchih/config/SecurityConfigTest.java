package com.richardjiang880.lernchih.config;

import com.richardjiang880.lernchih.security.ApiKeyAuthFilter;
import com.richardjiang880.lernchih.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SecurityConfigTest {

    @Mock
    private JwtAuthFilter jwtAuthFilter;

    @Mock
    private ApiKeyAuthFilter apiKeyAuthFilter;

    private final List<String> origins = List.of("http://localhost:5173");

    @Test
    void passwordEncoderReturnsBCryptPasswordEncoder() {
        SecurityConfig config = new SecurityConfig(jwtAuthFilter, apiKeyAuthFilter, origins);

        PasswordEncoder encoder = config.passwordEncoder();

        assertThat(encoder).isInstanceOf(BCryptPasswordEncoder.class);
    }

    @Test
    void authenticationManagerReturnsManagerFromConfiguration() throws Exception {
        SecurityConfig config = new SecurityConfig(jwtAuthFilter, apiKeyAuthFilter, origins);
        AuthenticationConfiguration authConfig = mock(AuthenticationConfiguration.class);
        AuthenticationManager manager = mock(AuthenticationManager.class);
        when(authConfig.getAuthenticationManager()).thenReturn(manager);

        assertThat(config.authenticationManager(authConfig)).isSameAs(manager);
    }

    @Test
    void corsConfigurationSourceExposesConfiguredOrigins() {
        SecurityConfig config = new SecurityConfig(jwtAuthFilter, apiKeyAuthFilter, origins);

        CorsConfigurationSource source = config.corsConfigurationSource();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");

        assertThat(source).isNotNull();
        assertThat(source.getCorsConfiguration(request))
                .isNotNull()
                .satisfies(cfg -> assertThat(cfg.getAllowedOrigins()).containsExactlyElementsOf(origins));
    }

    @Test
    void securityFilterChainBuildsWithDefaultHttpSecurity() throws Exception {
        SecurityConfig config = new SecurityConfig(jwtAuthFilter, apiKeyAuthFilter, origins);

        HttpSecurity http = mock(HttpSecurity.class, org.mockito.Mockito.RETURNS_SELF);
        DefaultSecurityFilterChain chain = mock(DefaultSecurityFilterChain.class);
        when(http.build()).thenReturn(chain);

        assertThat(config.securityFilterChain(http)).isSameAs(chain);
    }

    @Test
    void securityFilterChainBuildsWithHttpsOnlyEnabled() throws Exception {
        SecurityConfig config = new SecurityConfig(jwtAuthFilter, apiKeyAuthFilter, origins);
        ReflectionTestUtils.setField(config, "httpsOnly", true);

        HttpSecurity http = mock(HttpSecurity.class, org.mockito.Mockito.RETURNS_SELF);
        DefaultSecurityFilterChain chain = mock(DefaultSecurityFilterChain.class);
        when(http.build()).thenReturn(chain);

        assertThat(config.securityFilterChain(http)).isSameAs(chain);
    }
}
