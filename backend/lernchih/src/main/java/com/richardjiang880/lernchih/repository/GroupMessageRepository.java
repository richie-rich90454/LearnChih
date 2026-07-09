package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.GroupMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMessageRepository extends JpaRepository<GroupMessage, Long> {

    /**
     * All messages in a study group, oldest first.
     */
    List<GroupMessage> findByStudyGroupIdOrderBySentAtAsc(Long studyGroupId);
}
