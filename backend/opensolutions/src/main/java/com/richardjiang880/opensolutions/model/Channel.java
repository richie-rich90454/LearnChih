package com.richardjiang880.opensolutions.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "channels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Channel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "channel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChannelThread> threads = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
