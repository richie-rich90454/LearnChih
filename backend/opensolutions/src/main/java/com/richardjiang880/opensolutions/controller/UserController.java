package com.richardjiang880.opensolutions.controller;

import com.richardjiang880.opensolutions.dto.*;
import com.richardjiang880.opensolutions.model.User;
import com.richardjiang880.opensolutions.repository.UserRepository;
import com.richardjiang880.opensolutions.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(userService.getMyProfile(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(userService.updateProfile(user, request));
    }

    @PutMapping("/me/subjects")
    public ResponseEntity<UserProfileResponse> updateSubjects(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody List<Long> subjectIds) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(userService.updateSubjects(user, subjectIds));
    }

    @PostMapping("/me/socials")
    public ResponseEntity<UserSocialDto> addSocial(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UserSocialRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(userService.addSocial(user, request));
    }

    @DeleteMapping("/me/socials/{socialId}")
    public ResponseEntity<Void> removeSocial(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long socialId) {
        User user = getUserFromDetails(userDetails);
        userService.removeSocial(socialId, user);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
