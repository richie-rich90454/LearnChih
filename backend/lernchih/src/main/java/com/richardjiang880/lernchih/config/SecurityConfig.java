package com.richardjiang880.lernchih.config;

import com.richardjiang880.lernchih.security.ApiKeyAuthFilter;
import com.richardjiang880.lernchih.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
/**
 * Spring Security configuration with JWT stateless authentication.
 */
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ApiKeyAuthFilter apiKeyAuthFilter;
    private final List<String> corsAllowedOrigins;

    // When true (production behind an HTTPS terminator): require a secure
    // channel and enable HSTS preload. Defaults to false for local dev.
    @Value("${app.security.https-only:false}")
    private boolean httpsOnly;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          ApiKeyAuthFilter apiKeyAuthFilter,
                          List<String> corsAllowedOrigins) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.apiKeyAuthFilter = apiKeyAuthFilter;
        this.corsAllowedOrigins = corsAllowedOrigins;
    }

    // Cookie hardening guidance (Task 1.3): the app currently stores JWTs in
    // localStorage and does not issue Set-Cookie headers. Any future Set-Cookie
    // (e.g. a refresh-token cookie added in a later batch) MUST use
    // Secure; HttpOnly; SameSite=Lax. Verify with ResponseCookie builders.

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            // Stateless session - required for JWT-based authentication
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Security response headers (Task 1.1). HSTS is enabled only when
            // app.security.https-only is true (Task 1.2). Referrer-Policy and
            // Permissions-Policy are added by SecurityHeadersFilter.
            .headers(h -> {
                h.contentTypeOptions(Customizer.withDefaults());
                h.frameOptions(fo -> fo.deny());
                h.contentSecurityPolicy(csp -> csp.policyDirectives(
                        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                        + "img-src 'self' data: blob: https:; font-src 'self' data:; "
                        + "connect-src 'self' ws: wss:; frame-ancestors 'none'; "
                        + "base-uri 'self'; form-action 'self'"));
                if (httpsOnly) {
                    h.httpStrictTransportSecurity(hsts -> hsts
                            .maxAgeInSeconds(63072000)
                            .includeSubDomains(true)
                            .preload(true));
                }
            })
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/2fa/**").authenticated()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/files/**").permitAll()
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resources").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resources/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/channels").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/channels/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/study-groups").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/study-groups/{id}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/feeds/**").permitAll()
                .requestMatchers("/robots.txt").permitAll()
                .requestMatchers("/sitemap.xml").permitAll()
                .requestMatchers("/sitemap-resources.xml").permitAll()
                .requestMatchers("/sitemap-channels.xml").permitAll()
                .requestMatchers("/sitemap-static.xml").permitAll()
                // Public actuator and API documentation endpoints
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                // Static frontend assets produced by the production build
                .requestMatchers("/", "/index.html", "/assets/**", "/favicon.svg",
                        "/icons.svg", "/manifest.webmanifest", "/sw.js", "/workbox-*.js").permitAll()
                .requestMatchers("/api/admin/**").hasAnyRole("ADMIN", "MODERATOR")
                .requestMatchers("/actuator/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(apiKeyAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // HTTPS-only (production) mode: require a secure channel. HSTS preload
        // is configured above, also gated on the same flag.
        if (httpsOnly) {
            http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
        }

        return http.build();
    }

    // CORS configuration for frontend development and production. Allowed
    // origins come from the corsAllowedOrigins bean (EnvConfig), populated from
    // app.cors.allowed-origins / CORS_ORIGINS env var.
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(corsAllowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
}
