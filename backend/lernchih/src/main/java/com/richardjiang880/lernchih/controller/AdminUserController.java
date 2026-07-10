package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.UserStatus;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for admin user management: searchable paginated user list,
 * role assignment, and account-status changes (ACTIVE / SUSPENDED / BANNED).
 *
 * Admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;

    public AdminUserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<Page<UserSummary>> listUsers(
            @RequestParam(name = "search", required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        String q = search == null ? "" : search.trim();
        Page<User> page = q.isEmpty()
                ? userRepository.findAllByOrderByCreatedAtDesc(pageable)
                : userRepository.searchByNameOrEmail(q, pageable);
        return ResponseEntity.ok(page.map(AdminUserController::toSummary));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<UserSummary> updateRole(
            @PathVariable Long id,
            @RequestBody UpdateRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setRole(parseRole(request.role()));
        user = userRepository.save(user);
        return ResponseEntity.ok(toSummary(user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserSummary> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setAccountStatus(parseStatus(request.status()));
        user = userRepository.save(user);
        return ResponseEntity.ok(toSummary(user));
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<BulkActionResponse> bulkAction(@RequestBody BulkActionRequest request) {
        BulkAction action = parseBulkAction(request.action());
        List<Long> ids = request.userIds() == null ? List.of() : request.userIds();
        int processed = 0;
        for (Long id : ids) {
            Optional<User> opt = userRepository.findById(id);
            if (opt.isEmpty()) {
                continue;
            }
            User u = opt.get();
            switch (action) {
                case SUSPEND -> u.setAccountStatus(UserStatus.SUSPENDED);
                case ACTIVATE -> u.setAccountStatus(UserStatus.ACTIVE);
                case DELETE -> {
                    userRepository.deleteById(id);
                    processed++;
                    continue;
                }
            }
            userRepository.save(u);
            processed++;
        }
        return ResponseEntity.ok(new BulkActionResponse(processed));
    }

    private enum BulkAction { SUSPEND, ACTIVATE, DELETE }

    private static BulkAction parseBulkAction(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Action is required");
        }
        try {
            return BulkAction.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid action: " + raw);
        }
    }

    private static Role parseRole(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }
        try {
            return Role.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + raw);
        }
    }

    private static UserStatus parseStatus(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }
        try {
            return UserStatus.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + raw);
        }
    }

    private static UserSummary toSummary(User u) {
        return new UserSummary(
                u.getId(),
                u.getEmail(),
                u.getName(),
                u.getRole().name(),
                u.getAccountStatus().name(),
                u.getVerified(),
                u.getCredits(),
                u.getCreatedAt()
        );
    }

    /**
     * Admin-facing user projection. Excludes the password hash and lazy
     * associations (subjects, socials) so the payload stays small.
     */
    public record UserSummary(
            Long id,
            String email,
            String name,
            String role,
            String status,
            Boolean verified,
            Integer credits,
            LocalDateTime createdAt
    ) {}

    public record UpdateRoleRequest(String role) {}

    public record UpdateStatusRequest(String status) {}

    public record BulkActionRequest(String action, List<Long> userIds) {}

    public record BulkActionResponse(int processed) {}
}
