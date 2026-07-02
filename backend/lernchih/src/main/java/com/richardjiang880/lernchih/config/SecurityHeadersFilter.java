package com.richardjiang880.lernchih.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
/**
 * Sets security response headers that Spring Security's HeadersConfigurer does
 * not provide direct builders for: Referrer-Policy and Permissions-Policy.
 *
 * <p>HSTS, Content-Security-Policy, X-Content-Type-Options and X-Frame-Options
 * are configured centrally in {@link SecurityConfig} via the HttpSecurity
 * headers DSL. This filter only adds the two remaining headers.
 *
 * <p>Runs immediately after {@link RequestIdFilter} (HIGHEST_PRECEDENCE) so the
 * headers are present on every response, including short-circuited responses
 * such as 429s emitted by {@link RateLimitFilter}.
 */
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private static final String REFERRER_POLICY = "strict-origin-when-cross-origin";
    private static final String PERMISSIONS_POLICY =
            "camera=(), microphone=(), geolocation=(), interest-cohort=()";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Set headers before delegating so they persist on the response even
        // when a downstream filter short-circuits (e.g. rate limit 429).
        response.setHeader("Referrer-Policy", REFERRER_POLICY);
        response.setHeader("Permissions-Policy", PERMISSIONS_POLICY);
        filterChain.doFilter(request, response);
    }

    /**
     * Registers this filter just after {@link RequestIdFilter}, applying the
     * headers to all requests.
     */
    @Bean
    public FilterRegistrationBean<SecurityHeadersFilter> securityHeadersFilterRegistration(
            SecurityHeadersFilter filter) {
        FilterRegistrationBean<SecurityHeadersFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        registration.addUrlPatterns("/*");
        return registration;
    }
}
