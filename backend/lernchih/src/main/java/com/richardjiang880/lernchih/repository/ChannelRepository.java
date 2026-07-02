package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Channel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChannelRepository extends JpaRepository<Channel, Long> {

    Optional<Channel> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
