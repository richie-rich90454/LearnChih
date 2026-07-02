package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CreateReportRequest;
import com.richardjiang880.lernchih.model.Report;
import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.model.ReportTargetType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ReportRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    public ReportController(ReportRepository reportRepository, UserRepository userRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Report> createReport(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateReportRequest request) {
        User user = getUserFromDetails(userDetails);

        ReportTargetType targetType;
        try {
            targetType = ReportTargetType.valueOf(request.targetType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid target type");
        }

        Report report = Report.builder()
                .reporter(user)
                .targetType(targetType)
                .targetId(request.targetId())
                .reason(request.reason())
                .status(ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);
        return ResponseEntity.ok(report);
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
