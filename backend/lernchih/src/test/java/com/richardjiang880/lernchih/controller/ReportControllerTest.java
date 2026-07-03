package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CreateReportRequest;
import com.richardjiang880.lernchih.model.Report;
import com.richardjiang880.lernchih.model.ReportStatus;
import com.richardjiang880.lernchih.model.ReportTargetType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ReportRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportControllerTest {

    @Mock
    private ReportRepository reportRepository;
    @Mock
    private UserRepository userRepository;

    private ReportController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new ReportController(reportRepository, userRepository);
        user = User.builder().email("alice@example.com").password("pw").name("Alice").role(Role.STUDENT).build();
        user.setId(1L);
    }

    private UserDetails userDetails() {
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles("STUDENT")
                .build();
    }

    @Test
    void createReportSavesPendingReport() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(reportRepository.save(org.mockito.ArgumentMatchers.any(Report.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        CreateReportRequest request = new CreateReportRequest("spam", "resource", 10L);
        ResponseEntity<Report> result = controller.createReport(userDetails(), request);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        ArgumentCaptor<Report> captor = ArgumentCaptor.forClass(Report.class);
        verify(reportRepository).save(captor.capture());
        Report saved = captor.getValue();
        assertThat(saved.getReporter()).isEqualTo(user);
        assertThat(saved.getTargetType()).isEqualTo(ReportTargetType.RESOURCE);
        assertThat(saved.getStatus()).isEqualTo(ReportStatus.PENDING);
    }

    @Test
    void createReportRejectsInvalidTargetType() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        CreateReportRequest request = new CreateReportRequest("spam", "invalid", 10L);
        assertThatThrownBy(() -> controller.createReport(userDetails(), request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid target type");
    }
}
