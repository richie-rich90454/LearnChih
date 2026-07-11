package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ScreenShareDtos;
import com.richardjiang880.lernchih.model.ScreenShareSession;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ScreenShareSessionRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for study-group screen-share sessions (F44).
 *
 * <p>Endpoints (nested under /api/groups/{groupId}/screen-shares):
 * <ul>
 *   <li>GET  /            — list screen-share sessions for a group</li>
 *   <li>POST /            — start a screen-share session (sharer = caller)</li>
 *   <li>PUT  /{id}/end    — end a screen-share session (sharer only)</li>
 * </ul>
 *
 * <p>Stores only lifecycle metadata; real-time screen capture is handled
 * client-side via {@code getDisplayMedia}.
 */
@RestController
@RequestMapping("/api/groups/{groupId}/screen-shares")
public class ScreenShareController {

    private final ScreenShareSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public ScreenShareController(ScreenShareSessionRepository sessionRepository,
                                  UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<ScreenShareDtos.ScreenShareResponse>> list(
            @PathVariable Long groupId) {
        List<ScreenShareSession> sessions =
                sessionRepository.findByStudyGroupIdOrderByStartedAtDesc(groupId);
        if (sessions.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        Map<Long, String> nameById = resolveNames(sessions);
        return ResponseEntity.ok(sessions.stream().map(s -> toResponse(s, nameById)).toList());
    }

    @PostMapping
    public ResponseEntity<ScreenShareDtos.ScreenShareResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId) {
        User user = getUserFromDetails(userDetails);
        ScreenShareSession session = ScreenShareSession.builder()
                .studyGroupId(groupId)
                .sharerUserId(user.getId())
                .build();
        session = sessionRepository.save(session);
        Map<Long, String> nameById = resolveNames(List.of(session));
        return ResponseEntity.ok(toResponse(session, nameById));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<ScreenShareDtos.ScreenShareResponse> end(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        ScreenShareSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Screen-share session not found"));
        if (!session.getStudyGroupId().equals(groupId)) {
            throw new IllegalArgumentException("Screen-share session does not belong to this group");
        }
        if (!session.getSharerUserId().equals(user.getId())) {
            throw new IllegalStateException("Only the sharer can end the session");
        }
        if (session.getEndedAt() == null) {
            session.setEndedAt(LocalDateTime.now());
            session = sessionRepository.save(session);
        }
        Map<Long, String> nameById = resolveNames(List.of(session));
        return ResponseEntity.ok(toResponse(session, nameById));
    }

    private Map<Long, String> resolveNames(List<ScreenShareSession> sessions) {
        List<Long> sharerIds = sessions.stream()
                .map(ScreenShareSession::getSharerUserId)
                .distinct()
                .toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(sharerIds).forEach(u -> nameById.put(u.getId(), u.getName()));
        return nameById;
    }

    private ScreenShareDtos.ScreenShareResponse toResponse(
            ScreenShareSession session, Map<Long, String> nameById) {
        return new ScreenShareDtos.ScreenShareResponse(
                session.getId(),
                session.getStudyGroupId(),
                session.getSharerUserId(),
                nameById.getOrDefault(session.getSharerUserId(), "Unknown"),
                session.getStartedAt(),
                session.getEndedAt(),
                session.getEndedAt() == null);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
