package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.SharedDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedDeckRepository extends JpaRepository<SharedDeck, Long> {

    List<SharedDeck> findBySharedWithUserIdOrderBySharedAtDesc(Long sharedWithUserId);

    List<SharedDeck> findBySharedByUserIdOrderBySharedAtDesc(Long sharedByUserId);

    Optional<SharedDeck> findByDeckIdAndSharedWithUserId(Long deckId, Long sharedWithUserId);
}
