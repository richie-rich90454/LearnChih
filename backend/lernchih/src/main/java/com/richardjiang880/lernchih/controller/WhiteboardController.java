package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.WhiteboardDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.WhiteboardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for shared whiteboards (F42).
 *
 * <p>Endpoints (nested under /api/groups/{groupId}/whiteboards):
 * <ul>
 *   <li>GET    /         — list whiteboards for a group</li>
 *   <li>GET    /{id}     — fetch a single whiteboard</li>
 *   <li>POST   /         — create a whiteboard</li>
 *   <li>PUT    /{id}     — update title / strokes</li>
 *   <li>DELETE /{id}     — delete (creator only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/groups/{groupId}/whiteboards")
public class WhiteboardController {

    private final WhiteboardService whiteboardService;
    private final UserRepository userRepository;

    public WhiteboardController(WhiteboardService whiteboardService,
                                UserRepository userRepository) {
        this.whiteboardService = whiteboardService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<WhiteboardDtos.WhiteboardResponse>> list(
            @PathVariable Long groupId) {
        return ResponseEntity.ok(whiteboardService.listByGroup(groupId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WhiteboardDtos.WhiteboardResponse> get(
            @PathVariable Long groupId,
            @PathVariable Long id) {
        return ResponseEntity.ok(whiteboardService.get(id));
    }

    @PostMapping
    public ResponseEntity<WhiteboardDtos.WhiteboardResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @Valid @RequestBody WhiteboardDtos.CreateWhiteboardRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(whiteboardService.create(groupId, request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WhiteboardDtos.WhiteboardResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long id,
            @RequestBody WhiteboardDtos.UpdateWhiteboardRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(whiteboardService.update(id, request, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        whiteboardService.delete(id, user);
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
