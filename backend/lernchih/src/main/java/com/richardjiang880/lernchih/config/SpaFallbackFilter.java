package com.richardjiang880.lernchih.config;

import java.io.IOException;
import java.util.List;

import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * SPA fallback filter for the production frontend bundle.
 *
 * <p>For any GET request that is not an API call, actuator endpoint, or a known
 * static asset, the request is forwarded to {@code /index.html} so the React/Vite
 * SPA can render the matching client-side route. The filter is registered before
 * Spring Security so that deep links into the SPA are not blocked by the
 * authenticated catch-all rule.</p>
 */
public class SpaFallbackFilter extends OncePerRequestFilter {

    private static final List<String> EXCLUDED_PREFIXES = List.of("/api/", "/actuator/", "/ws/");
    private static final List<String> STATIC_PREFIXES = List.of("/assets/", "/sw.js", "/workbox-");
    private static final List<String> STATIC_EXACTS = List.of(
            "/robots.txt",
            "/sitemap.xml",
            "/sitemap-resources.xml",
            "/sitemap-channels.xml",
            "/sitemap-static.xml",
            "/favicon.svg",
            "/icons.svg",
            "/manifest.webmanifest"
    );
    private static final List<String> STATIC_EXTENSIONS = List.of(
            ".js", ".css", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".ico",
            ".json", ".xml", ".webmanifest", ".woff", ".woff2", ".ttf", ".eot"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getServletPath();

        if (shouldFallback(request, path)) {
            request.getRequestDispatcher("/index.html").forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private boolean shouldFallback(HttpServletRequest request, String path) {
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            return false;
        }
        for (String prefix : EXCLUDED_PREFIXES) {
            if (path.startsWith(prefix)) {
                return false;
            }
        }
        for (String prefix : STATIC_PREFIXES) {
            if (path.startsWith(prefix)) {
                return false;
            }
        }
        if (STATIC_EXACTS.contains(path)) {
            return false;
        }
        for (String extension : STATIC_EXTENSIONS) {
            if (path.endsWith(extension)) {
                return false;
            }
        }
        return true;
    }
}
