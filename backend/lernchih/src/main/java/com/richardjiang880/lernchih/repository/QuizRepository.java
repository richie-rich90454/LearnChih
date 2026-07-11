package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    @Query(value = "SELECT * FROM quizzes q WHERE NOT EXISTS "
            + "(SELECT 1 FROM quiz_attempts qa WHERE qa.quiz_id = q.id AND qa.user_id = :userId) "
            + "ORDER BY q.created_at DESC LIMIT 10",
            nativeQuery = true)
    List<Quiz> findUnattemptedByUserId(@Param("userId") Long userId);
}
