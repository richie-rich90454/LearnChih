package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ModerationItem;
import com.richardjiang880.lernchih.model.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModerationItemRepository extends JpaRepository<ModerationItem, Long> {

    Page<ModerationItem> findByStatus(ReportStatus status, Pageable pageable);

    long countByStatus(ReportStatus status);
}
