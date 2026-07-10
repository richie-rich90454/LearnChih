package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.EventRsvp;
import com.richardjiang880.lernchih.model.enums.RsvpStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {
    List<EventRsvp> findByEventIdOrderByRespondedAtAsc(Long eventId);
    Optional<EventRsvp> findByEventIdAndUserId(Long eventId, Long userId);
    long countByEventIdAndStatus(Long eventId, RsvpStatus status);
}
