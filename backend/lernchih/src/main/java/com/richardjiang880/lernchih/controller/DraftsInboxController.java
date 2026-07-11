package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.DraftItemDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.DraftService;
import com.richardjiang880.lernchih.service.DraftsInboxService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Unified drafts inbox endpoint (F64). Exposes a read-only aggregated
 * view of a user's drafts and allows deleting a draft directly from
 * the inbox.
 */
@RestController
@RequestMapping("/api/drafts")
public class DraftsInboxController {

    private final DraftsInboxService draftsInboxService;
    private final DraftService draftService;
    private final UserRepository userRepository;

    public DraftsInboxController(DraftsInboxService draftsInboxService,
                                 DraftService draftService,
                                 UserRepository userRepository) {
        this.draftsInboxService = draftsInboxService;
        this.draftService = draftService;
        this.userRepository = userRepository;
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<DraftItemDtos.DraftItemResponse>> getInbox(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUserFromDetails(userDetails);
        return ResponseEntity.ok(draftsInboxService.listInbox(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDraft(@AuthenticationPrincipal UserDetails userDetails,
                                             @PathVariable Long id) {
        User user = getUserFromDetails(userDetails);
        draftService.deleteDraft(id, user);
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
