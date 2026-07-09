package com.richardjiang880.lernchih.model;

import com.richardjiang880.lernchih.model.enums.ContentFormat;
import com.richardjiang880.lernchih.model.enums.DigestFrequency;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resource_threads")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false, unique = true)
    private Resource resource;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContentFormat format = ContentFormat.PLAIN;

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ResourcePost> posts = new ArrayList<>();

    /**
     * Default digest frequency advertised for this thread (F33). Individual
     * per-user subscriptions override this via ThreadSubscription.frequency.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "digest_frequency", length = 20)
    @Builder.Default
    private DigestFrequency digestFrequency = DigestFrequency.NONE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
