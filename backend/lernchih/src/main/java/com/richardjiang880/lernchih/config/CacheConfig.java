package com.richardjiang880.lernchih.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Enables Spring's cache abstraction backed by a simple in-memory
 * ConcurrentMapCache (no external cache server required). Used to cache
 * low-churn public GET endpoints (single resource / channel detail) to
 * reduce TTFB.
 *
 * Note: ConcurrentMapCache has no built-in TTL or size-based eviction.
 * Entries live until explicitly evicted via {@code @CacheEvict} (on writes)
 * or until the JVM restarts.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(
                new ConcurrentMapCache("resources"),
                new ConcurrentMapCache("channels")
        ));
        return manager;
    }
}
