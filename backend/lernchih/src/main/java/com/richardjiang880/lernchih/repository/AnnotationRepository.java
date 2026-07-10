package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Annotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnotationRepository extends JpaRepository<Annotation, Long> {

    List<Annotation> findByUserIdAndResourceIdOrderByCreatedAtAsc(Long userId, Long resourceId);

    List<Annotation> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
