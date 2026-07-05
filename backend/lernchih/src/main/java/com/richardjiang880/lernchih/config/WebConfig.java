package com.richardjiang880.lernchih.config;

import jakarta.servlet.Filter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

/**
 * Web MVC configuration for the bundled single-page application.
 *
 * <p>Registers the SPA fallback filter before Spring Security so that any
 * non-API, non-actuator, non-static route returns {@code index.html}.</p>
 */
@Configuration
public class WebConfig {

    @Bean
    public FilterRegistrationBean<Filter> spaFallbackFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>();
        registration.setFilter(new SpaFallbackFilter());
        registration.addUrlPatterns("/*");
        registration.setName("spaFallbackFilter");
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE + 1);
        return registration;
    }
}
