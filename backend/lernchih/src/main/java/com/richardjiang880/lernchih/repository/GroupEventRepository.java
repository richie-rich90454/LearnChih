package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.GroupEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupEventRepository extends JpaRepository<GroupEvent, Long> {
    List<GroupEvent> findByGroupIdOrderByStartTimeAsc(Long groupId);
}
