package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ChannelThread;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChannelThreadRepository extends JpaRepository<ChannelThread, Long> {

    Page<ChannelThread> findByChannelIdOrderByCreatedAtDesc(Long channelId, Pageable pageable);
}
