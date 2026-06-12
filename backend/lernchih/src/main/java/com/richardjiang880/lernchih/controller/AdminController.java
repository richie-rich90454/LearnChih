package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import com.richardjiang880.lernchih.service.ThreadService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
/**
 * REST controller for admin operations including report management.
 */
public class AdminController {

    private final ReportRepository reportRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final ThreadService threadService;

    public AdminController(ReportRepository reportRepository,
                           ResourceRepository resourceRepository,
                           UserRepository userRepository,
                           ThreadService threadService) {
        this.reportRepository = reportRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.threadService = threadService;
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(defaultValue = "PENDING") ReportStatus status,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<Report> reports = reportRepository.findByStatus(status, pageable);

        Page<ReportResponse> responsePage = reports.map(r -> new ReportResponse(
                r.getId(),
                r.getReporter().getId(),
                r.getReporter().getName(),
                r.getTargetType().name(),
                r.getTargetId(),
                r.getReason(),
                r.getStatus().name(),
                r.getResolvedBy() != null ? r.getResolvedBy().getId() : null,
                r.getResolvedBy() != null ? r.getResolvedBy().getName() : null,
                r.getResolvedAt(),
                r.getCreatedAt()
        ));

        return ResponseEntity.ok(responsePage);
    }

    @PutMapping("/reports/{id}/resolve")
    public ResponseEntity<ReportResponse> resolveReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ResolveReportRequest request) {
        User currentUser = getUserFromDetails(userDetails);

        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Report not found"));

        // Only PENDING reports can be resolved or dismissed
        if (report.getStatus() != ReportStatus.PENDING) {
            throw new IllegalArgumentException("Report is already resolved");
        }

        // Normalize action to lowercase for case-insensitive comparison
        String action = request.action().toLowerCase();
        if ("resolve".equals(action)) {
            report.setStatus(ReportStatus.RESOLVED);
        } else if ("dismiss".equals(action)) {
            report.setStatus(ReportStatus.DISMISSED);
        } else {
            throw new IllegalArgumentException("Invalid action. Use 'resolve' or 'dismiss'");
        }

        report.setResolvedBy(currentUser);
        report.setResolvedAt(LocalDateTime.now());
        report = reportRepository.save(report);

        ReportResponse response = new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getName(),
                report.getTargetType().name(),
                report.getTargetId(),
                report.getReason(),
                report.getStatus().name(),
                report.getResolvedBy().getId(),
                report.getResolvedBy().getName(),
                report.getResolvedAt(),
                report.getCreatedAt()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/resources/{id}")
    public ResponseEntity<Void> deleteResource(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User currentUser = getUserFromDetails(userDetails);
        resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));
        resourceRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam String type) {
        User currentUser = getUserFromDetails(userDetails);
        threadService.deletePost(id, type, currentUser);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
