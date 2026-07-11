package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.QuizQuestionStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface QuizQuestionStatRepository extends JpaRepository<QuizQuestionStat, Long> {

    Optional<QuizQuestionStat> findByQuestionId(Long questionId);

    List<QuizQuestionStat> findByQuestionIdIn(Collection<Long> questionIds);
}
