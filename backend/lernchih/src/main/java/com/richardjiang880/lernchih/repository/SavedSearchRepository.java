package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.SavedSearch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {

    /**
     * All saved searches owned by {@code userId}, newest first.
     */
    List<SavedSearch> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * A single saved search scoped to its owner, used for safe updates/deletes.
     */
    Optional<SavedSearch> findByIdAndUserId(Long id, Long userId);

    /**
     * Every saved search with email alerts enabled, used by the digest
     * scheduler to fan out notifications.
     */
    List<SavedSearch> findByEmailAlertsTrue();
}
