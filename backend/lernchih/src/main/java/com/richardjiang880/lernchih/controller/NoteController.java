package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.NoteDtos.CreateNoteRequest;
import com.richardjiang880.lernchih.dto.NoteDtos.NoteResponse;
import com.richardjiang880.lernchih.dto.NoteDtos.UpdateNoteRequest;
import com.richardjiang880.lernchih.model.Note;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NoteRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for notes (F9). Each note is scoped to its owner; create,
 * update, and delete verify ownership. The list endpoint accepts an optional
 * {@code q} query for title filtering (used by the wikilink search).
 */
@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteController(NoteRepository noteRepository, UserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(value = "q", required = false) String query) {
        User user = getUserFromDetails(userDetails);
        List<Note> notes = (query != null && !query.isBlank())
                ? noteRepository.findByUserIdAndTitleContainingIgnoreCase(user.getId(), query)
                : noteRepository.findByUserIdOrderByUpdatedAtDesc(user.getId());
        return ResponseEntity.ok(notes.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<NoteResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateNoteRequest request) {
        User user = getUserFromDetails(userDetails);
        Note note = Note.builder()
                .userId(user.getId())
                .title(request.title() == null || request.title().isBlank() ? "Untitled" : request.title())
                .content(request.content() == null ? "" : request.content())
                .subjectId(request.subjectId())
                .build();
        note = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(note));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdateNoteRequest request) {
        User user = getUserFromDetails(userDetails);
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found"));
        if (!note.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (request.title() != null && !request.title().isBlank()) {
            note.setTitle(request.title());
        }
        if (request.content() != null) {
            note.setContent(request.content());
        }
        if (request.subjectId() != null) {
            note.setSubjectId(request.subjectId());
        }
        note = noteRepository.save(note);
        return ResponseEntity.ok(toResponse(note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Note not found"));
        if (!note.getUserId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        noteRepository.delete(note);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private NoteResponse toResponse(Note n) {
        return new NoteResponse(
                n.getId(),
                n.getUserId(),
                n.getTitle(),
                n.getContent(),
                n.getSubjectId(),
                n.getCreatedAt(),
                n.getUpdatedAt()
        );
    }
}
