package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.VoiceRoomDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.VoiceRoom;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.repository.VoiceRoomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for study-group voice rooms (F43).
 *
 * <p>Endpoints (nested under /api/groups/{groupId}/voice-rooms):
 * <ul>
 *   <li>GET  /            — list voice rooms for a group</li>
 *   <li>POST /            — create a voice room (creator = caller)</li>
 *   <li>PUT  /{id}/end    — end (deactivate) a room (creator only)</li>
 * </ul>
 *
 * <p>The basic version stores only room lifecycle metadata; real-time audio
 * is handled client-side via {@code getUserMedia}.
 */
@RestController
@RequestMapping("/api/groups/{groupId}/voice-rooms")
public class VoiceRoomController {

    private final VoiceRoomRepository voiceRoomRepository;
    private final UserRepository userRepository;

    public VoiceRoomController(VoiceRoomRepository voiceRoomRepository,
                               UserRepository userRepository) {
        this.voiceRoomRepository = voiceRoomRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<VoiceRoomDtos.VoiceRoomResponse>> list(
            @PathVariable Long groupId) {
        List<VoiceRoom> rooms = voiceRoomRepository.findByStudyGroupIdOrderByCreatedAtDesc(groupId);
        if (rooms.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        Map<Long, String> nameById = resolveNames(rooms);
        return ResponseEntity.ok(rooms.stream().map(r -> toResponse(r, nameById)).toList());
    }

    @PostMapping
    public ResponseEntity<VoiceRoomDtos.VoiceRoomResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @RequestBody VoiceRoomDtos.CreateVoiceRoomRequest request) {
        User user = getUserFromDetails(userDetails);
        String name = request.name();
        if (name == null || name.isBlank()) {
            name = "Voice Room";
        }
        VoiceRoom room = VoiceRoom.builder()
                .studyGroupId(groupId)
                .name(name.trim())
                .createdBy(user.getId())
                .build();
        room = voiceRoomRepository.save(room);
        Map<Long, String> nameById = resolveNames(List.of(room));
        return ResponseEntity.ok(toResponse(room, nameById));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<VoiceRoomDtos.VoiceRoomResponse> end(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        VoiceRoom room = voiceRoomRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voice room not found"));
        if (!room.getStudyGroupId().equals(groupId)) {
            throw new IllegalArgumentException("Voice room does not belong to this group");
        }
        if (!room.getCreatedBy().equals(user.getId())) {
            throw new IllegalStateException("Only the room creator can end it");
        }
        room.setActive(false);
        room = voiceRoomRepository.save(room);
        Map<Long, String> nameById = resolveNames(List.of(room));
        return ResponseEntity.ok(toResponse(room, nameById));
    }

    private Map<Long, String> resolveNames(List<VoiceRoom> rooms) {
        List<Long> creatorIds = rooms.stream().map(VoiceRoom::getCreatedBy).distinct().toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(creatorIds).forEach(u -> nameById.put(u.getId(), u.getName()));
        return nameById;
    }

    private VoiceRoomDtos.VoiceRoomResponse toResponse(VoiceRoom room, Map<Long, String> nameById) {
        return new VoiceRoomDtos.VoiceRoomResponse(
                room.getId(),
                room.getStudyGroupId(),
                room.getName(),
                Boolean.TRUE.equals(room.getActive()),
                room.getCreatedBy(),
                nameById.getOrDefault(room.getCreatedBy(), "Unknown"),
                room.getCreatedAt());
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
