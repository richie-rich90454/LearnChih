package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
}
