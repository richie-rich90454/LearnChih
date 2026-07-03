package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.StudyGroupRequest;
import com.richardjiang880.lernchih.dto.StudyGroupResponse;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.StudyGroupService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StudyGroupControllerTest {

    @Mock
    private StudyGroupService studyGroupService;
    @Mock
    private UserRepository userRepository;

    private StudyGroupController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new StudyGroupController(studyGroupService, userRepository);
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

    private StudyGroupResponse groupResponse() {
        return new StudyGroupResponse(10L, "Java Group", "Study Java", 1L, LocalDateTime.now(), 1L);
    }

    @Test
    void listAllReturnsGroups() {
        when(studyGroupService.listAll()).thenReturn(List.of(groupResponse()));

        ResponseEntity<List<StudyGroupResponse>> result = controller.listAll();

        assertThat(result.getBody()).hasSize(1);
    }

    @Test
    void getGroupReturnsGroup() {
        StudyGroupResponse response = groupResponse();
        when(studyGroupService.getGroup(10L)).thenReturn(response);

        ResponseEntity<StudyGroupResponse> result = controller.getGroup(10L);

        assertThat(result.getBody()).isEqualTo(response);
    }

    @Test
    void createGroupReturnsGroup() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        StudyGroupRequest request = new StudyGroupRequest("Java Group", "Study Java");
        when(studyGroupService.createGroup(request, user)).thenReturn(groupResponse());

        ResponseEntity<StudyGroupResponse> result = controller.createGroup(userDetails(), request);

        assertThat(result.getBody().name()).isEqualTo("Java Group");
    }

    @Test
    void joinGroupReturnsGroup() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(studyGroupService.joinGroup(10L, user)).thenReturn(groupResponse());

        ResponseEntity<StudyGroupResponse> result = controller.joinGroup(userDetails(), 10L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void leaveGroupReturnsOk() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<Void> result = controller.leaveGroup(userDetails(), 10L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(studyGroupService).leaveGroup(10L, user);
    }
}
