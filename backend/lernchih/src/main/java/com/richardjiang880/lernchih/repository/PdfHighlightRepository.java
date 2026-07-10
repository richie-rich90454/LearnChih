package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PdfHighlight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PdfHighlightRepository extends JpaRepository<PdfHighlight, Long> {

    List<PdfHighlight> findByUserIdAndResourceIdOrderByPageNumberAsc(Long userId, Long resourceId);

    List<PdfHighlight> findByUserIdOrderByCreatedAtDesc(Long userId);
}
