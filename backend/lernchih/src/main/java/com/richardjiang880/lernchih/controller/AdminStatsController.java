package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.repository.ChannelPostRepository;
import com.richardjiang880.lernchih.repository.ReportRepository;
import com.richardjiang880.lernchih.repository.ResourcePostRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * REST controller exposing aggregate KPIs for the admin dashboard.
 *
 * Stats are computed on demand from existing repositories. There is no
 * materialized stats table; counts are cheap (COUNT queries) and the
 * endpoint is admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/stats")
public class AdminStatsController {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final ChannelPostRepository channelPostRepository;
    private final ResourcePostRepository resourcePostRepository;
    private final ReportRepository reportRepository;
    private final PresenceService presenceService;

    public AdminStatsController(UserRepository userRepository,
                                ResourceRepository resourceRepository,
                                ChannelPostRepository channelPostRepository,
                                ResourcePostRepository resourcePostRepository,
                                ReportRepository reportRepository,
                                PresenceService presenceService) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.channelPostRepository = channelPostRepository;
        this.resourcePostRepository = resourcePostRepository;
        this.reportRepository = reportRepository;
        this.presenceService = presenceService;
    }

    @GetMapping
    public ResponseEntity<AdminStatsDto> getStats() {
        long totalUsers = userRepository.count();
        long activeUsersToday = presenceService.countOnline();
        long totalResources = resourceRepository.count();
        long totalPosts = channelPostRepository.count() + resourcePostRepository.count();
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);
        long newSignupsThisWeek = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));

        return ResponseEntity.ok(new AdminStatsDto(
                totalUsers,
                activeUsersToday,
                totalResources,
                totalPosts,
                pendingReports,
                newSignupsThisWeek
        ));
    }

    /**
     * Snapshot of admin dashboard KPIs.
     *
     * @param totalUsers           total registered users
     * @param activeUsersToday     users currently online (best-effort signal
     *                             derived from the in-memory presence store)
     * @param totalResources       total learning resources
     * @param totalPosts           total channel + resource posts
     * @param pendingReports       reports still awaiting moderation
     * @param newSignupsThisWeek   users who signed up in the last 7 days
     */
    public record AdminStatsDto(
            long totalUsers,
            long activeUsersToday,
            long totalResources,
            long totalPosts,
            long pendingReports,
            long newSignupsThisWeek
    ) {}
}
