package com.richardjiang880.lernchih.config;

import org.junit.jupiter.api.Test;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.SimpleCacheManager;

import static org.assertj.core.api.Assertions.assertThat;

class CacheConfigTest {

    private final CacheConfig config = new CacheConfig();

    @Test
    void cacheManagerExposesResourcesAndChannelsCaches() {
        CacheManager manager = config.cacheManager();
        ((SimpleCacheManager) manager).initializeCaches();

        assertThat(manager.getCache("resources")).isNotNull();
        assertThat(manager.getCache("channels")).isNotNull();
        assertThat(manager.getCacheNames()).containsExactlyInAnyOrder("resources", "channels");
    }
}
