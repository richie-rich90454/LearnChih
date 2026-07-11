package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.Note;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.NoteRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.NoteExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * REST controller for note export to Markdown and PDF (F26). Both endpoints
 * verify that the requesting user owns the note before generating the export.
 */
@RestController
@RequestMapping("/api/notes")
public class NoteExportController {

    private final NoteExportService noteExportService;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public NoteExportController(NoteExportService noteExportService,
                                NoteRepository noteRepository,
                                UserRepository userRepository) {
        this.noteExportService = noteExportService;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{id}/export-markdown")
    public ResponseEntity<byte[]> exportMarkdown(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        verifyOwnership(id, user.getId());

        String markdown = noteExportService.exportMarkdown(id);
        String safeTitle = safeFilename(getNoteTitle(id));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_MARKDOWN);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + URLEncoder.encode(safeTitle + ".md", StandardCharsets.UTF_8));

        return ResponseEntity.ok().headers(headers)
                .body(markdown.getBytes(StandardCharsets.UTF_8));
    }

    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        verifyOwnership(id, user.getId());

        byte[] pdf;
        try {
            pdf = noteExportService.exportPdf(id);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export PDF: " + e.getMessage(), e);
        }

        String safeTitle = safeFilename(getNoteTitle(id));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + URLEncoder.encode(safeTitle + ".pdf", StandardCharsets.UTF_8));

        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    private void verifyOwnership(Long noteId, Long userId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found"));
        if (!note.getUserId().equals(userId)) {
            throw new IllegalStateException("Only the note owner can export it");
        }
    }

    private String getNoteTitle(Long noteId) {
        return noteRepository.findById(noteId)
                .map(Note::getTitle)
                .orElse("note");
    }

    private String safeFilename(String name) {
        if (name == null || name.isBlank()) {
            return "note";
        }
        return name.replaceAll("[^a-zA-Z0-9-_ ]", "").trim().replaceAll("\\s+", "_");
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
