package com.richardjiang880.lernchih.config;

import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.ChannelRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
/**
 * Redirects old numeric-id deep links to their canonical slug URLs so that
 * inbound links like {@code /resources/42} are permanently (301) redirected to
 * {@code /resources/<slug>}. Only public SPA paths are rewritten; {@code /api/...}
 * endpoints and POST/PUT/DELETE requests are passed through untouched.
 *
 * <p>Runs late (LOWEST_PRECEDENCE), after the Spring Security chain, so the
 * public redirect happens without authentication. If a numeric id does not
 * resolve to an entity the request is passed through and the SPA renders the
 * appropriate 404.
 */
public class SeoRedirectFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SeoRedirectFilter.class);

    private final ResourceRepository resourceRepository;
    private final ChannelRepository channelRepository;

    public SeoRedirectFilter(ResourceRepository resourceRepository,
                             ChannelRepository channelRepository) {
        this.resourceRepository = resourceRepository;
        this.channelRepository = channelRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        if (HttpMethod.GET.matches(request.getMethod())) {
            String target = computeRedirectTarget(request);
            if (target != null) {
                String location = request.getContextPath() + target;
                String query = request.getQueryString();
                if (query != null) {
                    location = location + "?" + query;
                }
                response.setStatus(HttpServletResponse.SC_MOVED_PERMANENTLY);
                response.setHeader("Location", location);
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Returns the slug-based redirect path for a numeric-id deep link, or
     * {@code null} when the request should be passed through.
     */
    private String computeRedirectTarget(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // Never rewrite API or infrastructure paths.
        if (uri.startsWith("/api/")) {
            return null;
        }

        if (uri.startsWith("/resources/")) {
            String segment = uri.substring("/resources/".length());
            if (segment.matches("\\d+")) {
                Optional<Resource> resource = resourceRepository.findById(Long.parseLong(segment));
                if (resource.isPresent()) {
                    return "/resources/" + resource.get().getSlug();
                }
                // Lookup failed: let the SPA handle the 404.
                log.debug("No resource found for numeric deep link {}", uri);
            }
        } else if (uri.startsWith("/channels/")) {
            String segment = uri.substring("/channels/".length());
            if (segment.matches("\\d+")) {
                Optional<Channel> channel = channelRepository.findById(Long.parseLong(segment));
                if (channel.isPresent()) {
                    return "/channels/" + channel.get().getSlug();
                }
                log.debug("No channel found for numeric deep link {}", uri);
            }
        }
        return null;
    }

    /**
     * Registers this filter after the security chain so public deep links are
     * redirected without requiring authentication.
     */
    @Bean
    public FilterRegistrationBean<SeoRedirectFilter> seoRedirectFilterRegistration(
            SeoRedirectFilter filter) {
        FilterRegistrationBean<SeoRedirectFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.LOWEST_PRECEDENCE);
        registration.addUrlPatterns("/*");
        return registration;
    }
}
