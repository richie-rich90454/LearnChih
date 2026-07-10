package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.repository.ChannelPostRepository;
import com.richardjiang880.lernchih.repository.ChannelThreadRepository;
import com.richardjiang880.lernchih.repository.ReportRepository;
import com.richardjiang880.lernchih.repository.ResourcePostRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.ResourceThreadRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * REST controller exposing the full admin dashboard KPI payload.
 *
 * Returns a richer set of metrics than {@link AdminStatsController}: it adds
 * totalThreads and reportedContentCount so the dashboard can render content
 * volume + moderation load at a glance. Counts are cheap (COUNT queries)
 * and the endpoint is admin-gated by SecurityConfig ("/api/admin/**").
 */
@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final ChannelThreadRepository channelThreadRepository;
    private final ResourceThreadRepository resourceThreadRepository;
    private final ChannelPostRepository channelPostRepository;
    private final ResourcePostRepository resourcePostRepository;
    private final ReportRepository reportRepository;
    private final PresenceService presenceService;

    public AdminDashboardController(UserRepository userRepository,
                                    ResourceRepository resourceRepository,
                                    ChannelThreadRepository channelThreadRepository,
                                    ResourceThreadRepository resourceThreadRepository,
                                    ChannelPostRepository channelPostRepository,
                                    ResourcePostRepository resourcePostRepository,
                                    ReportRepository reportRepository,
                                    PresenceService presenceService) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.channelThreadRepository = channelThreadRepository;
        this.resourceThreadRepository = resourceThreadRepository;
        this.channelPostRepository = channelPostRepository;
        this.resourcePostRepository = resourcePostRepository;
        this.reportRepository = reportRepository;
        this.presenceService = presenceService;
    }

    @GetMapping
    public ResponseEntity<DashboardDto> getDashboard() {
        long totalUsers = userRepository.count();
        long activeUsersToday = presenceService.countOnline();
        long totalResources = resourceRepository.count();
        long totalThreads = channelThreadRepository.count() + resourceThreadRepository.count();
        long totalPosts = channelPostRepository.count() + resourcePostRepository.count();
        long newSignupsThisWeek = userRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));
        long reportedContentCount = reportRepository.countByStatus(ReportStatus.PENDING);

        return ResponseEntity.ok(new DashboardDto(
                totalUsers,
                activeUsersToday,
                totalResources,
                totalThreads,
                totalPosts,
                newSignupsThisWeek,
                reportedContentCount
        ));
    }

    /**
     * Full admin dashboard KPI snapshot.
     *
     * @param totalUsers           total registered users
     * @param activeUsersToday     users currently online (best-effort signal
     *                             from the in-memory presence store)
     * @param totalResources       total learning resources
     * @param totalThreads         total channel + resource discussion threads
     * @param totalPosts           total channel + resource posts
     * @param newSignupsThisWeek   users who signed up in the last 7 days
     * @param reportedContentCount reports still awaiting moderation
     */
    public record DashboardDto(
            long totalUsers,
            long activeUsersToday,
            long totalResources,
            long totalThreads,
            long totalPosts,
            long newSignupsThisWeek,
            long reportedContentCount
    ) {}
}
