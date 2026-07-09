package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ConceptMapNode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConceptMapNodeRepository extends JpaRepository<ConceptMapNode, Long> {

    List<ConceptMapNode> findBySubjectId(Long subjectId);
}
