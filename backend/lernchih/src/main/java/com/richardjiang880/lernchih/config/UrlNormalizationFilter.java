package com.richardjiang880.lernchih.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Locale;

@Component
@Order(Ordered.LOWEST_PRECEDENCE - 1)
/**
 * Normalizes public (non-API) request URLs for SEO with a single 301 redirect:
 * strips trailing slashes (except for the root {@code /}), lowercases the path,
 * and (optionally) enforces a canonical host.
 *
 * <p>Disabled by default ({@code app.seo.url-normalize=false}) so local dev is
 * unaffected. API, WebSocket, actuator, OpenAPI and static-asset requests are
 * always passed through untouched. Runs late (just before {@link SeoRedirectFilter})
 * and after the Spring Security chain.
 */
public class UrlNormalizationFilter extends OncePerRequestFilter {

    private static final String[] SKIP_PREFIXES = {
            "/api/", "/ws/", "/actuator/", "/v3/api-docs", "/swagger-ui"
    };

    private static final String[] STATIC_EXTENSIONS = {
            ".js", ".css", ".svg", ".png", ".jpg", ".webp", ".ico", ".woff2"
    };

    private final boolean enabled;
    private final String canonicalHost;

    public UrlNormalizationFilter(
            @Value("${app.seo.url-normalize:false}") boolean enabled,
            @Value("${app.seo.canonical-host:}") String canonicalHost) {
        this.enabled = enabled;
        this.canonicalHost = canonicalHost != null ? canonicalHost.trim() : "";
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (!enabled) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        if (shouldSkip(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean hostChanged = false;
        String host = request.getHeader("Host");
        String targetHost = host;
        if (!canonicalHost.isEmpty()
                && (host == null || !canonicalHost.equalsIgnoreCase(host))) {
            targetHost = canonicalHost;
            hostChanged = true;
        }

        boolean pathChanged = false;
        String newPath = path;
        // Strip a trailing slash unless this is the root path "/".
        if (newPath.length() > 1 && newPath.endsWith("/")) {
            newPath = newPath.substring(0, newPath.length() - 1);
            pathChanged = true;
        }
        // Lowercase the path so casing variants consolidate to one canonical URL.
        String lower = newPath.toLowerCase(Locale.ROOT);
        if (!lower.equals(newPath)) {
            newPath = lower;
            pathChanged = true;
        }

        if (!hostChanged && !pathChanged) {
            filterChain.doFilter(request, response);
            return;
        }

        String location;
        if (hostChanged) {
            // Absolute URL so the browser is redirected to the canonical host.
            location = request.getScheme() + "://" + targetHost + newPath;
        } else {
            // Relative path is sufficient and avoids forcing a host/scheme.
            location = newPath;
        }
        String query = request.getQueryString();
        if (query != null) {
            location = location + "?" + query;
        }

        response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
        response.setHeader("Location", location);
    }

    private boolean shouldSkip(String uri) {
        for (String prefix : SKIP_PREFIXES) {
            if (uri.startsWith(prefix)) {
                return true;
            }
        }
        String lower = uri.toLowerCase(Locale.ROOT);
        for (String ext : STATIC_EXTENSIONS) {
            if (lower.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Registers this filter late in the chain (after security), running just
     * before {@link SeoRedirectFilter}.
     */
    @Bean
    public FilterRegistrationBean<UrlNormalizationFilter> urlNormalizationFilterRegistration(
            UrlNormalizationFilter filter) {
        FilterRegistrationBean<UrlNormalizationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.LOWEST_PRECEDENCE - 1);
        registration.addUrlPatterns("/*");
        return registration;
    }
}
