package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.CohortMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CohortMemberRepository extends JpaRepository<CohortMember, Long> {

    List<CohortMember> findByCohortIdOrderByJoinedAtAsc(Long cohortId);

    Optional<CohortMember> findByCohortIdAndUserId(Long cohortId, Long userId);

    long countByCohortId(Long cohortId);

    boolean existsByCohortIdAndUserId(Long cohortId, Long userId);
}
