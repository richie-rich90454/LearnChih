package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ConceptMapEdge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConceptMapEdgeRepository extends JpaRepository<ConceptMapEdge, Long> {

    List<ConceptMapEdge> findBySubjectId(Long subjectId);
}
