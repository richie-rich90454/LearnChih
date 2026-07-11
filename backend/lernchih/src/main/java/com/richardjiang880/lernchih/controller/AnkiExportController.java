package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.FlashcardDeckRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.AnkiExportService;
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
 * REST controller for Anki APKG export (F25). Exposes an endpoint that
 * generates and downloads an .apkg file for a flashcard deck owned by the
 * authenticated user.
 */
@RestController
@RequestMapping("/api/flashcard-decks")
public class AnkiExportController {

    private final AnkiExportService ankiExportService;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final UserRepository userRepository;

    public AnkiExportController(AnkiExportService ankiExportService,
                                FlashcardDeckRepository flashcardDeckRepository,
                                UserRepository userRepository) {
        this.ankiExportService = ankiExportService;
        this.flashcardDeckRepository = flashcardDeckRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/{deckId}/export-anki")
    public ResponseEntity<byte[]> exportAnki(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long deckId) {
        User user = getUserFromDetails(userDetails);

        flashcardDeckRepository.findById(deckId).ifPresent(deck -> {
            if (!deck.getUserId().equals(user.getId())) {
                throw new IllegalStateException("Only the deck owner can export it");
            }
        });

        byte[] apkg;
        try {
            apkg = ankiExportService.exportApkg(deckId);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to export Anki deck: " + e.getMessage(), e);
        }

        String filename = URLEncoder.encode("flashcards.apkg", StandardCharsets.UTF_8)
                .replace("+", "%20");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + filename);

        return ResponseEntity.ok().headers(headers).body(apkg);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
