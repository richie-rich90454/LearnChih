package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.model.ApiKey;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ApiKeyRateLimitService;
import com.richardjiang880.lernchih.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyService apiKeyService;
    private final ApiKeyRateLimitService rateLimitService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public ApiKeyAuthFilter(ApiKeyService apiKeyService,
                            ApiKeyRateLimitService rateLimitService,
                            UserDetailsService userDetailsService,
                            UserRepository userRepository) {
        this.apiKeyService = apiKeyService;
        this.rateLimitService = rateLimitService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader(API_KEY_HEADER);

        if (StringUtils.hasText(apiKey) && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<ApiKey> keyOpt = apiKeyService.verifyApiKeyEntity(apiKey);
            if (keyOpt.isPresent()) {
                ApiKey keyEntity = keyOpt.get();
                if (!rateLimitService.checkAndRecord(keyEntity.getId())) {
                    response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"error\":\"rate_limit_exceeded\"}");
                    return;
                }
                String email = userRepository.findById(keyEntity.getUserId())
                        .map(u -> u.getEmail())
                        .orElseThrow(() -> new IllegalStateException("API key references unknown user"));
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
                apiKeyService.recordUsage(apiKey);
            }
        }

        filterChain.doFilter(request, response);
    }
}
