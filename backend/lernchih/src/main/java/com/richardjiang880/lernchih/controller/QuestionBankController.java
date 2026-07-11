package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.QuestionBankDtos.ImportResponse;
import com.richardjiang880.lernchih.dto.QuestionBankDtos.QuestionBankRequest;
import com.richardjiang880.lernchih.dto.QuestionBankDtos.QuestionBankResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.QuestionBankService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the question bank (F18). Exposes list / get / create /
 * update / delete endpoints under {@code /api/question-bank}, plus an import
 * endpoint that copies a bank question into an existing quiz. All operations
 * are scoped to the authenticated user's own bank entries.
 */
@RestController
@RequestMapping("/api/question-bank")
public class QuestionBankController {

    private final QuestionBankService questionBankService;
    private final UserRepository userRepository;

    public QuestionBankController(QuestionBankService questionBankService,
                                  UserRepository userRepository) {
        this.questionBankService = questionBankService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<QuestionBankResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String query) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(questionBankService.list(user.getId(), tag, query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> get(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        QuestionBankResponse response = questionBankService.get(user.getId(), id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<QuestionBankResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody QuestionBankRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(questionBankService.create(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionBankResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody QuestionBankRequest request) {
        User user = getUserFromDetails(userDetails);
        QuestionBankResponse response = questionBankService.update(user.getId(), id, request);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        if (questionBankService.delete(user.getId(), id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/{id}/import")
    public ResponseEntity<ImportResponse> importIntoQuiz(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody com.richardjiang880.lernchih.dto.QuestionBankDtos.ImportRequest request) {
        User user = getUserFromDetails(userDetails);
        ImportResponse response = questionBankService.importIntoQuiz(user.getId(), id, request.quizId());
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
