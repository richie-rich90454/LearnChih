package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.NoteCollaboratorDtos.AddCollaboratorRequest;
import com.richardjiang880.lernchih.dto.NoteCollaboratorDtos.NoteCollaboratorResponse;
import com.richardjiang880.lernchih.model.NoteCollaborator;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NoteCollaboratorRepository;
import com.richardjiang880.lernchih.repository.NoteRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for note collaborators (F14). Only the note owner may add or
 * remove collaborators; any collaborator (including the owner) may list them.
 * Endpoint base: {@code /api/notes/{noteId}/collaborators}.
 */
@RestController
@RequestMapping("/api/notes/{noteId}/collaborators")
public class NoteCollaboratorController {

    private static final String OWNER_ROLE = "OWNER";

    private final NoteCollaboratorRepository collaboratorRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteCollaboratorController(
            NoteCollaboratorRepository collaboratorRepository,
            NoteRepository noteRepository,
            UserRepository userRepository) {
        this.collaboratorRepository = collaboratorRepository;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<NoteCollaboratorResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long noteId) {
        User user = getUserFromDetails(userDetails);
        if (!isCollaborator(noteId, user.getId()) && !isOwner(noteId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<NoteCollaborator> collaborators = collaboratorRepository.findByNoteIdOrderByAddedAtAsc(noteId);
        return ResponseEntity.ok(collaborators.stream().map(this::toResponse).toList());
    }

    @PostMapping
    public ResponseEntity<NoteCollaboratorResponse> add(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long noteId,
            @RequestBody AddCollaboratorRequest request) {
        User user = getUserFromDetails(userDetails);
        if (!isOwner(noteId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        if (collaboratorRepository.existsByNoteIdAndUserId(noteId, request.userId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        String role = (request.role() == null || request.role().isBlank())
                ? "EDITOR" : request.role().toUpperCase();
        if (OWNER_ROLE.equals(role)) {
            // Only the note owner holds the OWNER role.
            role = "EDITOR";
        }
        NoteCollaborator collaborator = NoteCollaborator.builder()
                .noteId(noteId)
                .userId(request.userId())
                .role(role)
                .build();
        collaborator = collaboratorRepository.save(collaborator);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(collaborator));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long noteId,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        if (!isOwner(noteId, user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        NoteCollaborator collaborator = collaboratorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collaborator not found"));
        if (!collaborator.getNoteId().equals(noteId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        if (OWNER_ROLE.equals(collaborator.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        collaboratorRepository.delete(collaborator);
        return ResponseEntity.noContent().build();
    }

    private boolean isOwner(Long noteId, Long userId) {
        return noteRepository.findById(noteId)
                .map(note -> note.getUserId().equals(userId))
                .orElse(false);
    }

    private boolean isCollaborator(Long noteId, Long userId) {
        return collaboratorRepository.existsByNoteIdAndUserId(noteId, userId);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private NoteCollaboratorResponse toResponse(NoteCollaborator c) {
        String userName = userRepository.findById(c.getUserId())
                .map(User::getName)
                .orElse("Unknown");
        return new NoteCollaboratorResponse(
                c.getId(),
                c.getNoteId(),
                c.getUserId(),
                userName,
                c.getRole(),
                c.getAddedAt()
        );
    }
}
