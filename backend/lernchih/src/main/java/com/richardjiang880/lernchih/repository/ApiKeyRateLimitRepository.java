package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ApiKeyRateLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiKeyRateLimitRepository extends JpaRepository<ApiKeyRateLimit, Long> {

    Optional<ApiKeyRateLimit> findByApiKeyId(Long apiKeyId);
}