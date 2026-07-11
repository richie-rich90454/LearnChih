package com.richardjiang880.lernchih.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_key_rate_limits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKeyRateLimit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "api_key_id", nullable = false, unique = true)
    private Long apiKeyId;

    @Column(name = "requests_per_minute", nullable = false)
    @Builder.Default
    private Integer requestsPerMinute = 60;

    @Column(name = "requests_per_hour", nullable = false)
    @Builder.Default
    private Integer requestsPerHour = 1000;

    @Column(name = "requests_per_day", nullable = false)
    @Builder.Default
    private Integer requestsPerDay = 10000;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}