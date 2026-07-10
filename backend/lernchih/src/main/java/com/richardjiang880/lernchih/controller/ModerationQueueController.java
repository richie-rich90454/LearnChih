package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.ModerationItem;
import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ModerationItemRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * REST controller for the admin moderation queue with SLA tracking.
 *
 * Exposes a paginated list of {@link ModerationItem} entries (optionally
 * filtered by status) and endpoints to assign, resolve, or dismiss items.
 * All endpoints are admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/moderation")
public class ModerationQueueController {

    private final ModerationItemRepository moderationItemRepository;
    private final UserRepository userRepository;

    public ModerationQueueController(ModerationItemRepository moderationItemRepository,
                                     UserRepository userRepository) {
        this.moderationItemRepository = moderationItemRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<ModerationItem>> listItems(
            @RequestParam(name = "status", required = false) String status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<ModerationItem> page;
        if (status != null && !status.isBlank()) {
            ReportStatus rs = parseStatus(status);
            page = moderationItemRepository.findByStatus(rs, pageable);
        } else {
            page = moderationItemRepository.findAll(pageable);
        }
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<ModerationItem> assign(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ModerationItem item = moderationItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moderation item not found"));
        User admin = getUserFromDetails(userDetails);
        item.setAssignedTo(admin.getId());
        item = moderationItemRepository.save(item);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<ModerationItem> resolve(@PathVariable Long id) {
        ModerationItem item = moderationItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moderation item not found"));
        item.setStatus(ReportStatus.RESOLVED);
        item.setResolvedAt(LocalDateTime.now());
        item = moderationItemRepository.save(item);
        return ResponseEntity.ok(item);
    }

    @PutMapping("/{id}/dismiss")
    public ResponseEntity<ModerationItem> dismiss(@PathVariable Long id) {
        ModerationItem item = moderationItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Moderation item not found"));
        item.setStatus(ReportStatus.DISMISSED);
        item.setResolvedAt(LocalDateTime.now());
        item = moderationItemRepository.save(item);
        return ResponseEntity.ok(item);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }

    private static ReportStatus parseStatus(String raw) {
        try {
            return ReportStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + raw);
        }
    }
}
