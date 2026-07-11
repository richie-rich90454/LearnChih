package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * REST controller for the admin system health dashboard (F93).
 *
 * Exposes a single aggregate endpoint that returns JVM memory, disk, uptime,
 * a basic database status, and the active user count. Admin-gated by
 * SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/health")
public class SystemHealthController {

    private final UserRepository userRepository;

    public SystemHealthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Runtime runtime = Runtime.getRuntime();
        long usedBytes = runtime.totalMemory() - runtime.freeMemory();
        long maxBytes = runtime.maxMemory();

        File disk = new File(".");
        long freeBytes = disk.getUsableSpace();

        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();

        long activeUserCount;
        try {
            activeUserCount = userRepository.count();
        } catch (Exception ex) {
            // If the DB is unreachable, surface DOWN rather than 500 so the
            // dashboard can still render the other metrics.
            activeUserCount = -1;
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("dbStatus", activeUserCount >= 0 ? "UP" : "DOWN");
        body.put("memoryUsedMb", bytesToMb(usedBytes));
        body.put("memoryMaxMb", bytesToMb(maxBytes));
        body.put("diskFreeGb", bytesToGb(freeBytes));
        body.put("uptimeMs", uptimeMs);
        body.put("activeUserCount", activeUserCount);
        return ResponseEntity.ok(body);
    }

    private static long bytesToMb(long bytes) {
        return bytes / (1024L * 1024L);
    }

    private static long bytesToGb(long bytes) {
        return bytes / (1024L * 1024L * 1024L);
    }
}
