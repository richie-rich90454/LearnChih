package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.StudyGroupRequest;
import com.richardjiang880.lernchih.dto.StudyGroupResponse;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.StudyGroupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-groups")
public class StudyGroupController {

    private final StudyGroupService studyGroupService;
    private final UserRepository userRepository;

    public StudyGroupController(StudyGroupService studyGroupService,
                                UserRepository userRepository) {
        this.studyGroupService = studyGroupService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<StudyGroupResponse>> listAll() {
        return ResponseEntity.ok(studyGroupService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyGroupResponse> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(studyGroupService.getGroup(id));
    }

    @PostMapping
    public ResponseEntity<StudyGroupResponse> createGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody StudyGroupRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(studyGroupService.createGroup(request, user));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<StudyGroupResponse> joinGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(studyGroupService.joinGroup(id, user));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        studyGroupService.leaveGroup(id, user);
        return ResponseEntity.ok().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
