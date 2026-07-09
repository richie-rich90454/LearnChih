package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CourseProgressDtos.CompleteModuleRequest;
import com.richardjiang880.lernchih.dto.CourseProgressDtos.CourseProgressResponse;
import com.richardjiang880.lernchih.dto.CourseProgressDtos.ModuleProgressItem;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.CourseProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for course module completion tracking (F3).
 */
@RestController
@RequestMapping("/api/courses/{courseId}/progress")
public class CourseProgressController {

    private final CourseProgressService courseProgressService;
    private final UserRepository userRepository;

    public CourseProgressController(CourseProgressService courseProgressService,
                                    UserRepository userRepository) {
        this.courseProgressService = courseProgressService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<CourseProgressResponse> getProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(courseProgressService.getCourseProgress(user.getId(), courseId));
    }

    @PostMapping("/modules/{moduleId}/complete")
    public ResponseEntity<ModuleProgressItem> markComplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long moduleId,
            @RequestBody(required = false) CompleteModuleRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(courseProgressService.markComplete(user.getId(), courseId, moduleId, request));
    }

    @DeleteMapping("/modules/{moduleId}/complete")
    public ResponseEntity<Void> markIncomplete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long courseId,
            @PathVariable Long moduleId) {
        User user = getUserFromDetails(userDetails);
        courseProgressService.markIncomplete(user.getId(), moduleId);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
