package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Whiteboard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WhiteboardRepository extends JpaRepository<Whiteboard, Long> {
    List<Whiteboard> findByGroupIdOrderByUpdatedAtDesc(Long groupId);
}
