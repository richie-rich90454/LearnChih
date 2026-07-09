package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private UserRepository userRepository;

    private UserController controller;
    private User user;

    @BeforeEach
    void setUp() {
        controller = new UserController(userService, userRepository);
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

    private UserProfileResponse profile() {
        return new UserProfileResponse(1L, "alice@example.com", "Alice", "bio", null, null, null, "STUDENT", 0, List.of(), List.of(), null);
    }

    @Test
    void getMyProfileReturnsProfile() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(userService.getMyProfile(user)).thenReturn(profile());

        ResponseEntity<UserProfileResponse> result = controller.getMyProfile(userDetails());

        assertThat(result.getBody().email()).isEqualTo("alice@example.com");
    }

    @Test
    void getProfileByIdReturnsProfile() {
        when(userService.getProfile(1L)).thenReturn(profile());

        ResponseEntity<UserProfileResponse> result = controller.getProfile(1L);

        assertThat(result.getBody()).isEqualTo(profile());
    }

    @Test
    void updateProfileReturnsUpdatedProfile() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        UpdateProfileRequest request = new UpdateProfileRequest("Alice Updated", "New bio", null, null, null);
        UserProfileResponse updated = new UserProfileResponse(1L, "alice@example.com", "Alice Updated", "New bio", null, null, null, "STUDENT", 0, List.of(), List.of(), null);
        when(userService.updateProfile(user, request)).thenReturn(updated);

        ResponseEntity<UserProfileResponse> result = controller.updateProfile(userDetails(), request);

        assertThat(result.getBody().name()).isEqualTo("Alice Updated");
    }

    @Test
    void updateSubjectsReturnsProfile() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        List<Long> subjectIds = List.of(10L, 20L);
        when(userService.updateSubjects(user, subjectIds)).thenReturn(profile());

        ResponseEntity<UserProfileResponse> result = controller.updateSubjects(userDetails(), subjectIds);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void addSocialReturnsSocialDto() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        UserSocialRequest request = new UserSocialRequest("github", "https://github.com/alice");
        UserSocialDto dto = new UserSocialDto(5L, "github", "https://github.com/alice");
        when(userService.addSocial(user, request)).thenReturn(dto);

        ResponseEntity<UserSocialDto> result = controller.addSocial(userDetails(), request);

        assertThat(result.getBody()).isEqualTo(dto);
    }

    @Test
    void removeSocialReturnsNoContent() {
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        ResponseEntity<Void> result = controller.removeSocial(userDetails(), 5L);

        assertThat(result.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        verify(userService).removeSocial(5L, user);
    }
}
