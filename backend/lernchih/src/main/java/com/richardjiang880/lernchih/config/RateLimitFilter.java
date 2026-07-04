package com.richardjiang880.lernchih.config;

import tools.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.net.URI;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
/**
 * Token-bucket rate limiter (Bucket4j 8.x) applied per client IP.
 *
 * <p>Two bucket profiles are supported, selected by request path/method:
 * <ul>
 *   <li>{@code /api/auth/**} - all methods - uses the stricter "auth" bucket
 *       ({@code app.ratelimit.auth.*}).</li>
 *   <li>{@code /api/**} write methods (POST/PUT/DELETE/PATCH) - uses the
 *       "write" bucket ({@code app.ratelimit.write.*}).</li>
 * </ul>
 * Other requests (GET reads, static, swagger, actuator) are not rate limited
 * by this filter.
 *
 * <p>Buckets are keyed by {@code "<profile>:<clientIp>"} and stored in a
 * process-local {@link ConcurrentHashMap}. Capacity and refill rates are
 * configuration-driven, so the same mechanism can be retuned for any endpoint
 * group without code changes.
 *
 * <p>When a bucket is exhausted the filter short-circuits with an RFC 7807
 * Problem Detail (429 Too Many Requests) and does not invoke the rest of the
 * chain. It runs after {@link SecurityHeadersFilter} so security headers are
 * present on the 429 response.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    private final int authCapacity;
    private final int authRefillPerMinute;
    private final int writeCapacity;
    private final int writeRefillPerMinute;

    public RateLimitFilter(ObjectMapper objectMapper,
                           @Value("${app.ratelimit.auth.capacity:10}") int authCapacity,
                           @Value("${app.ratelimit.auth.refill-per-minute:10}") int authRefillPerMinute,
                           @Value("${app.ratelimit.write.capacity:60}") int writeCapacity,
                           @Value("${app.ratelimit.write.refill-per-minute:60}") int writeRefillPerMinute) {
        this.objectMapper = objectMapper;
        this.authCapacity = authCapacity;
        this.authRefillPerMinute = authRefillPerMinute;
        this.writeCapacity = writeCapacity;
        this.writeRefillPerMinute = writeRefillPerMinute;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        Bucket bucket = resolveBucket(request, uri);
        if (bucket != null && !bucket.tryConsume(1)) {
            writeTooManyRequests(response, uri);
            return;
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Selects the bucket for the request, or {@code null} when the request
     * should not be rate limited.
     */
    private Bucket resolveBucket(HttpServletRequest request, String uri) {
        String clientIp = clientIp(request);
        if (uri.startsWith("/api/auth/")) {
            return buckets.computeIfAbsent("auth:" + clientIp,
                    k -> newBucket(authCapacity, authRefillPerMinute));
        }
        if (uri.startsWith("/api/") && isWriteMethod(request.getMethod())) {
            return buckets.computeIfAbsent("write:" + clientIp,
                    k -> newBucket(writeCapacity, writeRefillPerMinute));
        }
        return null;
    }

    private boolean isWriteMethod(String method) {
        if (method == null) {
            return false;
        }
        return switch (method.toUpperCase()) {
            case "POST", "PUT", "DELETE", "PATCH" -> true;
            default -> false;
        };
    }

    /**
     * Resolves the client IP, honoring the first hop of X-Forwarded-For when
     * present (e.g. behind a reverse proxy), falling back to the socket
     * remote address.
     */
    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int comma = forwarded.indexOf(',');
            return comma > 0 ? forwarded.substring(0, comma).trim() : forwarded.trim();
        }
        return request.getRemoteAddr();
    }

    private Bucket newBucket(int capacity, int refillPerMinute) {
        return Bucket.builder()
                .addLimit(limit -> limit
                        .capacity(capacity)
                        .refillIntervally(refillPerMinute, Duration.ofMinutes(1)))
                .build();
    }

    private void writeTooManyRequests(HttpServletResponse response, String uri) throws IOException {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(
                HttpStatus.TOO_MANY_REQUESTS, "Rate limit exceeded");
        pd.setTitle("Too Many Requests");
        pd.setType(URI.create("about:blank"));
        pd.setInstance(URI.create(uri));

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_PROBLEM_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(pd));
    }

    /**
     * Registers this filter after {@link RequestIdFilter} and
     * {@link SecurityHeadersFilter} so security headers are already on the
     * response when a 429 is emitted.
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimitFilter filter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 2);
        registration.addUrlPatterns("/*");
        return registration;
    }
}
