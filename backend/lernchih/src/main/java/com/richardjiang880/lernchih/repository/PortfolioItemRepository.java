package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PortfolioItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {

    /**
     * All portfolio items for {@code userId}, ordered by the owner's curation
     * (displayOrder) then creation time for a stable tie-break.
     */
    List<PortfolioItem> findByUserIdOrderByDisplayOrderAscCreatedAtAsc(Long userId);

    /**
     * A single portfolio item scoped to its owner, used for safe updates/deletes.
     */
    Optional<PortfolioItem> findByIdAndUserId(Long id, Long userId);
}
