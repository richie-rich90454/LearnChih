package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.NoteCollaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteCollaboratorRepository extends JpaRepository<NoteCollaborator, Long> {

    List<NoteCollaborator> findByNoteIdOrderByAddedAtAsc(Long noteId);

    Optional<NoteCollaborator> findByNoteIdAndUserId(Long noteId, Long userId);

    boolean existsByNoteIdAndUserId(Long noteId, Long userId);
}
