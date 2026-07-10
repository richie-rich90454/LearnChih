package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.GroupEventDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.GroupEventService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for group events / meetups (F41).
 *
 * <p>Endpoints (nested under /api/groups/{groupId}/events):
 * <ul>
 *   <li>GET    /               — list events for a group</li>
 *   <li>POST   /               — create an event</li>
 *   <li>POST   /{eventId}/rsvp — update RSVP status</li>
 *   <li>GET    /{eventId}/rsvps — list attendees</li>
 *   <li>DELETE /{eventId}      — delete (creator only)</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/groups/{groupId}/events")
public class GroupEventController {

    private final GroupEventService groupEventService;
    private final UserRepository userRepository;

    public GroupEventController(GroupEventService groupEventService, UserRepository userRepository) {
        this.groupEventService = groupEventService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<GroupEventDtos.GroupEventResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(groupEventService.listByGroup(groupId, user));
    }

    @PostMapping
    public ResponseEntity<GroupEventDtos.GroupEventResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @Valid @RequestBody GroupEventDtos.CreateEventRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(groupEventService.create(groupId, request, user));
    }

    @PostMapping("/{eventId}/rsvp")
    public ResponseEntity<GroupEventDtos.GroupEventResponse> rsvp(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long eventId,
            @RequestBody GroupEventDtos.UpdateRsvpRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(groupEventService.updateRsvp(eventId, request.status(), user));
    }

    @GetMapping("/{eventId}/rsvps")
    public ResponseEntity<List<GroupEventDtos.RsvpResponse>> rsvps(
            @PathVariable Long groupId,
            @PathVariable Long eventId) {
        return ResponseEntity.ok(groupEventService.listRsvps(eventId));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long groupId,
            @PathVariable Long eventId) {
        User user = getUserFromDetails(userDetails);
        groupEventService.delete(eventId, user);
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
