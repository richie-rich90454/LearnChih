package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    List<Note> findByUserIdOrderByUpdatedAtDesc(Long userId);

    List<Note> findByUserIdAndTitleContainingIgnoreCase(Long userId, String title);

    Optional<Note> findByUserIdAndTitleIgnoreCase(Long userId, String title);
}
