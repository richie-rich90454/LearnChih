package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.PlaylistDtos.AddItemRequest;
import com.richardjiang880.lernchih.dto.PlaylistDtos.CreatePlaylistRequest;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistDetailResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistItemResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.UpdatePlaylistRequest;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.PlaylistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for study playlists (F2).
 */
@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    private final PlaylistService playlistService;
    private final UserRepository userRepository;

    public PlaylistController(PlaylistService playlistService, UserRepository userRepository) {
        this.playlistService = playlistService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<PlaylistResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreatePlaylistRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.createPlaylist(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<PlaylistResponse>> list(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.listPlaylists(user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlaylistDetailResponse> get(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.getPlaylist(user.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistResponse> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody UpdatePlaylistRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.updatePlaylist(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        playlistService.deletePlaylist(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<PlaylistItemResponse> addItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestBody AddItemRequest request) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.addItem(user.getId(), id, request));
    }

    @DeleteMapping("/{id}/items/{itemId}")
    public ResponseEntity<Void> removeItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @PathVariable Long itemId) {
        User user = getUserFromDetails(userDetails);
        playlistService.removeItem(user.getId(), id, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items/{itemId}/move")
    public ResponseEntity<List<PlaylistItemResponse>> moveItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @PathVariable Long itemId,
            @RequestParam(defaultValue = "up") String direction) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(playlistService.moveItem(user.getId(), id, itemId, direction));
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
