package com.richardjiang880.opensolutions.repository;

import com.richardjiang880.opensolutions.model.Resource;
import com.richardjiang880.opensolutions.model.ResourceCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    Page<Resource> findBySubjectId(Long subjectId, Pageable pageable);

    Page<Resource> findByCategory(ResourceCategory category, Pageable pageable);

    Page<Resource> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:subjectId IS NULL OR r.subject.id = :subjectId) AND " +
           "(:category IS NULL OR r.category = :category)")
    Page<Resource> findWithFilters(
        @Param("subjectId") Long subjectId,
        @Param("category") ResourceCategory category,
        Pageable pageable
    );
}
