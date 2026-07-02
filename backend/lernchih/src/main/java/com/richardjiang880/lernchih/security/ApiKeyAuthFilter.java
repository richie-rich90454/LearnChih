package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ApiKeyService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyService apiKeyService;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    public ApiKeyAuthFilter(ApiKeyService apiKeyService,
                            UserDetailsService userDetailsService,
                            UserRepository userRepository) {
        this.apiKeyService = apiKeyService;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader(API_KEY_HEADER);

        if (StringUtils.hasText(apiKey) && SecurityContextHolder.getContext().getAuthentication() == null) {
            apiKeyService.verifyApiKey(apiKey).ifPresent(userId -> {
                String email = userRepository.findById(userId)
                        .map(u -> u.getEmail())
                        .orElseThrow(() -> new IllegalStateException("API key references unknown user"));
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authToken);
                apiKeyService.recordUsage(apiKey);
            });
        }

        filterChain.doFilter(request, response);
    }
}
