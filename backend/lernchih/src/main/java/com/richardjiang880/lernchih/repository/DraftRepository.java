package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Draft;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftRepository extends JpaRepository<Draft, Long> {

    List<Draft> findByUserIdOrderByUpdatedAtDesc(Long userId);
}
