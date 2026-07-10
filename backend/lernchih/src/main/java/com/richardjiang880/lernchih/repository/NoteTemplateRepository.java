package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.NoteTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteTemplateRepository extends JpaRepository<NoteTemplate, Long> {

    /** System templates (userId is null) plus the user's own templates. */
    List<NoteTemplate> findByUserIdOrUserIdIsNullOrderByNameAsc(Long userId);

    List<NoteTemplate> findByUserIdOrderByNameAsc(Long userId);
}
