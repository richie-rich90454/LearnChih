package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for {@link QuestionBank} entries (F18). Supports listing a
 * user's bank, searching by tag (CSV substring) or by question text, and
 * the standard {@link JpaRepository} CRUD operations.
 */
public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    List<QuestionBank> findByOwnerUserIdOrderByCreatedAtDesc(Long ownerUserId);

    List<QuestionBank> findByOwnerUserIdAndTagsContainingIgnoreCaseOrderByCreatedAtDesc(
            Long ownerUserId, String tag);

    List<QuestionBank> findByOwnerUserIdAndQuestionContainingIgnoreCaseOrderByCreatedAtDesc(
            Long ownerUserId, String query);
}
