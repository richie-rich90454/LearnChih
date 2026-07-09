package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.FriendshipDtos.FriendshipResponse;
import com.richardjiang880.lernchih.model.Friendship;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.FriendshipStatus;
import com.richardjiang880.lernchih.repository.FriendshipRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * REST controller for the friends / study-buddies system (F38).
 *
 * <p>Endpoints:
 * <ul>
 *   <li>POST   /api/friends/request/{userId} — send a friend request</li>
 *   <li>POST   /api/friends/{id}/accept     — accept an incoming request</li>
 *   <li>POST   /api/friends/{id}/decline    — decline an incoming request</li>
 *   <li>DELETE /api/friends/{id}            — unfriend / cancel</li>
 *   <li>GET    /api/friends                 — list accepted friends</li>
 *   <li>GET    /api/friends/requests        — list pending incoming requests</li>
 *   <li>GET    /api/friends/sent            — list pending sent requests</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/friends")
public class FriendshipController {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public FriendshipController(FriendshipRepository friendshipRepository,
                                UserRepository userRepository) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/request/{userId}")
    @Transactional
    public ResponseEntity<FriendshipResponse> sendRequest(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long userId) {
        User me = getUserFromDetails(userDetails);
        if (me.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot send a friend request to yourself");
        }
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Friendship existing = friendshipRepository
                .findBetweenUsers(me.getId(), userId).orElse(null);
        if (existing != null) {
            if (existing.getStatus() == FriendshipStatus.ACCEPTED) {
                throw new IllegalStateException("You are already friends");
            }
            if (existing.getStatus() == FriendshipStatus.BLOCKED) {
                throw new IllegalStateException("This friendship is blocked");
            }
            if (existing.getStatus() == FriendshipStatus.PENDING) {
                throw new IllegalStateException("A friend request is already pending");
            }
        }

        Friendship f = Friendship.builder()
                .requesterId(me.getId())
                .addresseeId(userId)
                .status(FriendshipStatus.PENDING)
                .build();
        f = friendshipRepository.save(f);
        return ResponseEntity.ok(toResponse(f, me.getId()));
    }

    @PostMapping("/{id}/accept")
    @Transactional
    public ResponseEntity<FriendshipResponse> accept(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        Friendship f = friendshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        if (!f.getAddresseeId().equals(me.getId())) {
            throw new IllegalArgumentException("Only the recipient can accept a friend request");
        }
        if (f.getStatus() != FriendshipStatus.PENDING) {
            throw new IllegalStateException("Friend request is no longer pending");
        }
        f.setStatus(FriendshipStatus.ACCEPTED);
        f = friendshipRepository.save(f);
        return ResponseEntity.ok(toResponse(f, me.getId()));
    }

    @PostMapping("/{id}/decline")
    @Transactional
    public ResponseEntity<Void> decline(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        Friendship f = friendshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Friend request not found"));
        if (!f.getRequesterId().equals(me.getId())
                && !f.getAddresseeId().equals(me.getId())) {
            throw new IllegalArgumentException("You are not part of this friendship");
        }
        friendshipRepository.delete(f);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> unfriend(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        Friendship f = friendshipRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Friendship not found"));
        if (!f.getRequesterId().equals(me.getId())
                && !f.getAddresseeId().equals(me.getId())) {
            throw new IllegalArgumentException("You are not part of this friendship");
        }
        friendshipRepository.delete(f);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<FriendshipResponse>> listFriends(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<Friendship> accepted = friendshipRepository
                .findAcceptedByUserId(me.getId());
        return ResponseEntity.ok(toResponseList(accepted, me.getId(), null));
    }

    @GetMapping("/requests")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FriendshipResponse>> listIncoming(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<Friendship> pending = friendshipRepository
                .findByAddresseeIdAndStatus(me.getId(), FriendshipStatus.PENDING);
        return ResponseEntity.ok(toResponseList(pending, me.getId(), "INCOMING"));
    }

    @GetMapping("/sent")
    @Transactional(readOnly = true)
    public ResponseEntity<List<FriendshipResponse>> listSent(
            @AuthenticationPrincipal UserDetails userDetails) {
        User me = getUserFromDetails(userDetails);
        List<Friendship> pending = friendshipRepository
                .findByRequesterIdAndStatus(me.getId(), FriendshipStatus.PENDING);
        return ResponseEntity.ok(toResponseList(pending, me.getId(), "OUTGOING"));
    }

    private List<FriendshipResponse> toResponseList(
            List<Friendship> friendships, Long currentUserId, String direction) {
        if (friendships.isEmpty()) {
            return List.of();
        }
        List<Long> otherIds = friendships.stream()
                .map(f -> otherUserId(f, currentUserId))
                .toList();
        Map<Long, User> userMap = userRepository.findAllById(otherIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        return friendships.stream()
                .map(f -> {
                    Long otherId = otherUserId(f, currentUserId);
                    User other = userMap.get(otherId);
                    String dir = direction;
                    if (dir == null && f.getStatus() == FriendshipStatus.PENDING) {
                        dir = f.getRequesterId().equals(currentUserId)
                                ? "OUTGOING" : "INCOMING";
                    }
                    return new FriendshipResponse(
                            f.getId(),
                            otherId,
                            other != null ? other.getName() : null,
                            f.getStatus().name(),
                            dir,
                            f.getCreatedAt()
                    );
                })
                .toList();
    }

    private FriendshipResponse toResponse(Friendship f, Long currentUserId) {
        Long otherId = otherUserId(f, currentUserId);
        User other = userRepository.findById(otherId).orElse(null);
        String dir = null;
        if (f.getStatus() == FriendshipStatus.PENDING) {
            dir = f.getRequesterId().equals(currentUserId)
                    ? "OUTGOING" : "INCOMING";
        }
        return new FriendshipResponse(
                f.getId(),
                otherId,
                other != null ? other.getName() : null,
                f.getStatus().name(),
                dir,
                f.getCreatedAt()
        );
    }

    private Long otherUserId(Friendship f, Long currentUserId) {
        return f.getRequesterId().equals(currentUserId)
                ? f.getAddresseeId()
                : f.getRequesterId();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException(
                        "Authenticated user not found in database"));
    }
}
