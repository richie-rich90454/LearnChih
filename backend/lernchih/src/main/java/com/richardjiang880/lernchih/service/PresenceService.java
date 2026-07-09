package com.richardjiang880.lernchih.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks user presence in memory. A user is considered "online" if a heartbeat
 * has been recorded within the {@link #ONLINE_WINDOW_SECONDS} window. This is a
 * best-effort, single-instance presence store; in a multi-node deployment a
 * shared cache (Redis) would back this map.
 */
@Service
public class PresenceService {

    static final long ONLINE_WINDOW_SECONDS = 60;

    private final Map<Long, LocalDateTime> lastSeen = new ConcurrentHashMap<>();

    /**
     * Record a heartbeat for the given user, marking them as currently online.
     */
    public void heartbeat(Long userId) {
        if (userId == null) {
            return;
        }
        lastSeen.put(userId, LocalDateTime.now());
    }

    /**
     * Mark a user as going offline (e.g. on explicit disconnect).
     */
    public void offline(Long userId) {
        if (userId == null) {
            return;
        }
        lastSeen.remove(userId);
    }

    /**
     * Whether the user has sent a heartbeat within the online window.
     */
    public boolean isOnline(Long userId) {
        LocalDateTime seen = lastSeen.get(userId);
        if (seen == null) {
            return false;
        }
        return seen.isAfter(LocalDateTime.now().minusSeconds(ONLINE_WINDOW_SECONDS));
    }

    /**
     * The last time a heartbeat was recorded, or null if the user has never
     * been seen.
     */
    public LocalDateTime lastSeen(Long userId) {
        return lastSeen.get(userId);
    }

    /**
     * Count of users with a heartbeat within the online window. Used by the
     * admin stats endpoint as a best-effort "active now" signal.
     */
    public long countOnline() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(ONLINE_WINDOW_SECONDS);
        return lastSeen.values().stream().filter(seen -> seen.isAfter(cutoff)).count();
    }
}
