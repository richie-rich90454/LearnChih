package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {

    List<StudyGroup> findByOwnerUserId(Long ownerUserId);

    Optional<StudyGroup> findById(Long id);
}
