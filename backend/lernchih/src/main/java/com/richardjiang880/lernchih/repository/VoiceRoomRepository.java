package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.VoiceRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoiceRoomRepository extends JpaRepository<VoiceRoom, Long> {

    List<VoiceRoom> findByStudyGroupIdOrderByCreatedAtDesc(Long studyGroupId);
}
