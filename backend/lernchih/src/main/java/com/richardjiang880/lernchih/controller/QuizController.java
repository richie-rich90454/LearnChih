package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.QuizDtos.QuizAnalyticsResponse;
import com.richardjiang880.lernchih.dto.QuizDtos.QuizResponse;
import com.richardjiang880.lernchih.dto.QuizDtos.SubmitRequest;
import com.richardjiang880.lernchih.dto.QuizDtos.SubmitResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.QuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for quiz taking (F16). Exposes list / get / submit
 * endpoints under {@code /api/quizzes}. Submit resolves the authenticated
 * user so attempts can be attributed; list + get are available to any
 * authenticated user.
 */
@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final UserRepository userRepository;

    public QuizController(QuizService quizService, UserRepository userRepository) {
        this.quizService = quizService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<QuizResponse>> list() {
        return ResponseEntity.ok(quizService.listQuizzes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuizResponse> get(@PathVariable Long id) {
        QuizResponse response = quizService.getQuiz(id);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<SubmitResponse> submit(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody SubmitRequest request) {
        User user = getUserFromDetails(userDetails);
        SubmitResponse response = quizService.submit(user.getId(), id, request);
        if (response == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<QuizAnalyticsResponse> analytics(@PathVariable Long id) {
        QuizAnalyticsResponse response = quizService.getAnalytics(id);
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
