package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ReportResponse;
import com.richardjiang880.lernchih.dto.ResolveReportRequest;
import com.richardjiang880.lernchih.model.Report;
import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.model.ReportTargetType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ReportRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.ThreadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ThreadService threadService;

    private AdminController controller;
    private User admin;
    private User reporter;

    @BeforeEach
    void setUp() {
        controller = new AdminController(reportRepository, resourceRepository, userRepository, threadService);
        admin = User.builder().email("admin@example.com").password("pw").name("Admin").role(Role.ADMIN).build();
        admin.setId(1L);
        reporter = User.builder().email("reporter@example.com").password("pw").name("Reporter").role(Role.STUDENT).build();
        reporter.setId(2L);
    }

    private UserDetails adminDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(admin.getEmail())
                .password(admin.getPassword())
                .roles("ADMIN")
                .build();
    }

    private Report pendingReport() {
        Report report = Report.builder()
                .reporter(reporter)
                .targetType(ReportTargetType.RESOURCE)
                .targetId(10L)
                .reason("spam")
                .status(ReportStatus.PENDING)
                .build();
        report.setId(5L);
        return report;
    }

    @Test
    void getReportsReturnsMappedPage() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<Report> page = new PageImpl<>(List.of(pendingReport()));
        when(reportRepository.findByStatus(ReportStatus.PENDING, pageable)).thenReturn(page);

        ResponseEntity<Page<ReportResponse>> result = controller.getReports(ReportStatus.PENDING, pageable);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getContent()).hasSize(1);
        assertThat(result.getBody().getContent().get(0).status()).isEqualTo("PENDING");
    }

    @Test
    void resolveReportResolvesPendingReport() {
        Report report = pendingReport();
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<ReportResponse> result = controller.resolveReport(adminDetails(), 5L, new ResolveReportRequest("resolve"));

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(result.getBody().status()).isEqualTo("RESOLVED");
        assertThat(result.getBody().resolvedBy()).isEqualTo(admin.getId());
    }

    @Test
    void resolveReportDismissesPendingReport() {
        Report report = pendingReport();
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(reportRepository.save(any(Report.class))).thenAnswer(inv -> inv.getArgument(0));

        ResponseEntity<ReportResponse> result = controller.resolveReport(adminDetails(), 5L, new ResolveReportRequest("DISMISS"));

        assertThat(result.getBody().status()).isEqualTo("DISMISSED");
    }

    @Test
    void resolveReportRejectsInvalidAction() {
        Report report = pendingReport();
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> controller.resolveReport(adminDetails(), 5L, new ResolveReportRequest("ban")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid action");
    }

    @Test
    void resolveReportRejectsNonPendingReport() {
        Report report = pendingReport();
        report.setStatus(ReportStatus.RESOLVED);
        when(reportRepository.findById(5L)).thenReturn(Optional.of(report));
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        assertThatThrownBy(() -> controller.resolveReport(adminDetails(), 5L, new ResolveReportRequest("resolve")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already resolved");
    }

    @Test
    void deleteResourceRemovesResource() {
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(resourceRepository.findById(10L)).thenReturn(Optional.of(mock(com.richardjiang880.lernchih.model.Resource.class)));

        ResponseEntity<Void> result = controller.deleteResource(adminDetails(), 10L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(resourceRepository).deleteById(10L);
    }

    @Test
    void deletePostDelegatesToThreadService() {
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        ResponseEntity<Void> result = controller.deletePost(adminDetails(), 7L, "RESOURCE_POST");

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(threadService).deletePost(7L, "RESOURCE_POST", admin);
    }
}
