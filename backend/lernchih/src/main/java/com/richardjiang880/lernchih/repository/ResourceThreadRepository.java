package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ResourceThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResourceThreadRepository extends JpaRepository<ResourceThread, Long> {

    Optional<ResourceThread> findByResourceId(Long resourceId);
}
