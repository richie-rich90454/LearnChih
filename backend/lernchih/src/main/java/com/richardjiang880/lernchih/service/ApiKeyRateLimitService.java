package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.ApiKeyRateLimit;
import com.richardjiang880.lernchih.repository.ApiKeyRateLimitRepository;
import com.richardjiang880.lernchih.repository.ApiKeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ApiKeyRateLimitService {

    private final ApiKeyRateLimitRepository rateLimitRepository;
    private final ApiKeyRepository apiKeyRepository;

    private final Map<Long, ConcurrentLinkedDeque<Long>> minuteWindows = new ConcurrentHashMap<>();
    private final Map<Long, ConcurrentLinkedDeque<Long>> hourWindows = new ConcurrentHashMap<>();
    private final Map<Long, ConcurrentLinkedDeque<Long>> dayWindows = new ConcurrentHashMap<>();
    private final Map<Long, AtomicLong> totalCounters = new ConcurrentHashMap<>();

    public ApiKeyRateLimitService(ApiKeyRateLimitRepository rateLimitRepository,
                                  ApiKeyRepository apiKeyRepository) {
        this.rateLimitRepository = rateLimitRepository;
        this.apiKeyRepository = apiKeyRepository;
    }

    @Transactional
    public ApiKeyRateLimit setRateLimit(Long apiKeyId, Integer perMinute, Integer perHour, Integer perDay) {
        apiKeyRepository.findById(apiKeyId)
                .orElseThrow(() -> new IllegalArgumentException("API key not found"));
        ApiKeyRateLimit limit = rateLimitRepository.findByApiKeyId(apiKeyId)
                .orElseGet(() -> ApiKeyRateLimit.builder().apiKeyId(apiKeyId).build());
        if (perMinute != null) limit.setRequestsPerMinute(perMinute);
        if (perHour != null) limit.setRequestsPerHour(perHour);
        if (perDay != null) limit.setRequestsPerDay(perDay);
        return rateLimitRepository.save(limit);
    }

    @Transactional(readOnly = true)
    public Optional<ApiKeyRateLimit> getRateLimit(Long apiKeyId) {
        return rateLimitRepository.findByApiKeyId(apiKeyId);
    }

    @Transactional(readOnly = true)
    public List<ApiKeyRateLimit> getAllRateLimits() {
        return rateLimitRepository.findAll();
    }

    public boolean checkAndRecord(Long apiKeyId) {
        Optional<ApiKeyRateLimit> opt = rateLimitRepository.findByApiKeyId(apiKeyId);
        if (opt.isEmpty()) return true;
        ApiKeyRateLimit limit = opt.get();
        long now = System.currentTimeMillis();

        ConcurrentLinkedDeque<Long> minuteDeque = minuteWindows.computeIfAbsent(apiKeyId, k -> new ConcurrentLinkedDeque<>());
        ConcurrentLinkedDeque<Long> hourDeque = hourWindows.computeIfAbsent(apiKeyId, k -> new ConcurrentLinkedDeque<>());
        ConcurrentLinkedDeque<Long> dayDeque = dayWindows.computeIfAbsent(apiKeyId, k -> new ConcurrentLinkedDeque<>());

        evictOld(minuteDeque, now - 60_000);
        evictOld(hourDeque, now - 3_600_000);
        evictOld(dayDeque, now - 86_400_000);

        if (minuteDeque.size() >= limit.getRequestsPerMinute()) return false;
        if (hourDeque.size() >= limit.getRequestsPerHour()) return false;
        if (dayDeque.size() >= limit.getRequestsPerDay()) return false;

        minuteDeque.addLast(now);
        hourDeque.addLast(now);
        dayDeque.addLast(now);
        totalCounters.computeIfAbsent(apiKeyId, k -> new AtomicLong()).incrementAndGet();
        return true;
    }

    public long getUsageCount(Long apiKeyId) {
        AtomicLong counter = totalCounters.get(apiKeyId);
        return counter != null ? counter.get() : 0;
    }

    public Map<String, Long> getUsageSnapshot(Long apiKeyId) {
        long now = System.currentTimeMillis();
        ConcurrentLinkedDeque<Long> m = minuteWindows.get(apiKeyId);
        ConcurrentLinkedDeque<Long> h = hourWindows.get(apiKeyId);
        ConcurrentLinkedDeque<Long> d = dayWindows.get(apiKeyId);
        long minuteCount = m != null ? m.stream().filter(t -> t > now - 60_000).count() : 0;
        long hourCount = h != null ? h.stream().filter(t -> t > now - 3_600_000).count() : 0;
        long dayCount = d != null ? d.stream().filter(t -> t > now - 86_400_000).count() : 0;
        Map<String, Long> result = new LinkedHashMap<>();
        result.put("minute", minuteCount);
        result.put("hour", hourCount);
        result.put("day", dayCount);
        result.put("total", getUsageCount(apiKeyId));
        return result;
    }

    public List<Map<String, Object>> getAllUsage() {
        List<ApiKeyRateLimit> limits = rateLimitRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (ApiKeyRateLimit limit : limits) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("apiKeyId", limit.getApiKeyId());
            entry.put("requestsPerMinute", limit.getRequestsPerMinute());
            entry.put("requestsPerHour", limit.getRequestsPerHour());
            entry.put("requestsPerDay", limit.getRequestsPerDay());
            entry.put("usage", getUsageSnapshot(limit.getApiKeyId()));
            result.add(entry);
        }
        return result;
    }

    private void evictOld(ConcurrentLinkedDeque<Long> deque, long cutoff) {
        while (!deque.isEmpty() && deque.peekFirst() < cutoff) {
            deque.pollFirst();
        }
    }
}
