package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ThreadSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThreadSubscriptionRepository extends JpaRepository<ThreadSubscription, Long> {

    Optional<ThreadSubscription> findByUserIdAndThreadId(Long userId, Long threadId);
}
