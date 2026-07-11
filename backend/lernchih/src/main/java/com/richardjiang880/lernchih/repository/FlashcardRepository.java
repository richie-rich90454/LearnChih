package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {

    List<Flashcard> findByDeckId(Long deckId);

    List<Flashcard> findByDeckIdInAndNextReviewLessThanEqual(List<Long> deckIds, LocalDate date);
}
