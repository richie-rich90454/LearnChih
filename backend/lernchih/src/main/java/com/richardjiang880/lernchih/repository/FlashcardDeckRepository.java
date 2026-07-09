package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {

    List<FlashcardDeck> findByUserIdOrderByIdDesc(Long userId);
}
