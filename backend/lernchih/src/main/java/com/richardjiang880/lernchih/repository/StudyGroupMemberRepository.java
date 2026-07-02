package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.StudyGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudyGroupMemberRepository extends JpaRepository<StudyGroupMember, Long> {

    List<StudyGroupMember> findByGroupId(Long groupId);

    Optional<StudyGroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
}
