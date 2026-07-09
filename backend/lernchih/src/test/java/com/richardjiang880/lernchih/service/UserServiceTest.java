package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.UserSocial;
import com.richardjiang880.lernchih.repository.SubjectRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.repository.UserSocialRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserSocialRepository userSocialRepository;
    @Mock
    private SubjectRepository subjectRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getProfileReturnsMappedResponse() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .name("Alice")
                .bio("Hello")
                .role(Role.STUDENT)
                .credits(10)
                .subjects(List.of(Subject.builder().name("Math").build()))
                .build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userSocialRepository.findByUserId(1L)).thenReturn(List.of());

        UserProfileResponse response = userService.getProfile(1L);

        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.name()).isEqualTo("Alice");
        assertThat(response.bio()).isEqualTo("Hello");
        assertThat(response.credits()).isEqualTo(10);
        assertThat(response.subjects()).containsExactly("Math");
    }

    @Test
    void getProfileThrowsWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getProfile(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getMyProfileReturnsResponseForGivenUser() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .name("Alice")
                .role(Role.STUDENT)
                .credits(5)
                .build();
        when(userSocialRepository.findByUserId(1L)).thenReturn(List.of());

        UserProfileResponse response = userService.getMyProfile(user);

        assertThat(response.email()).isEqualTo("alice@example.com");
        assertThat(response.credits()).isEqualTo(5);
    }

    @Test
    void updateProfileSavesChanges() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .name("Old")
                .bio("Old bio")
                .role(Role.STUDENT)
                .credits(0)
                .build();
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userSocialRepository.findByUserId(1L)).thenReturn(List.of());

        UserProfileResponse response = userService.updateProfile(user, new UpdateProfileRequest("Alice", "New bio", null, null, null));

        assertThat(user.getName()).isEqualTo("Alice");
        assertThat(user.getBio()).isEqualTo("New bio");
        assertThat(response.name()).isEqualTo("Alice");
    }

    @Test
    void updateSubjectsReplacesSubjectList() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .name("Alice")
                .role(Role.STUDENT)
                .credits(0)
                .build();
        Subject math = Subject.builder().id(1L).name("Math").build();
        Subject physics = Subject.builder().id(2L).name("Physics").build();
        when(subjectRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(math, physics));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(userSocialRepository.findByUserId(1L)).thenReturn(List.of());

        UserProfileResponse response = userService.updateSubjects(user, List.of(1L, 2L));

        assertThat(user.getSubjects()).containsExactly(math, physics);
        assertThat(response.subjects()).containsExactly("Math", "Physics");
    }

    @Test
    void addSocialCreatesAndReturnsDto() {
        User user = User.builder().id(1L).build();
        UserSocial social = UserSocial.builder().id(5L).platform("github").url("https://github.com/alice").build();
        when(userSocialRepository.save(any(UserSocial.class))).thenReturn(social);

        UserSocialDto dto = userService.addSocial(user, new UserSocialRequest("github", "https://github.com/alice"));

        assertThat(dto.id()).isEqualTo(5L);
        assertThat(dto.platform()).isEqualTo("github");
        assertThat(dto.url()).isEqualTo("https://github.com/alice");
    }

    @Test
    void removeSocialDeletesOwnedLink() {
        User user = User.builder().id(1L).build();
        UserSocial social = UserSocial.builder().id(5L).user(user).build();
        when(userSocialRepository.findById(5L)).thenReturn(Optional.of(social));

        userService.removeSocial(5L, user);

        verify(userSocialRepository).delete(social);
    }

    @Test
    void removeSocialThrowsForForeignLink() {
        User owner = User.builder().id(1L).build();
        User other = User.builder().id(2L).build();
        UserSocial social = UserSocial.builder().id(5L).user(owner).build();
        when(userSocialRepository.findById(5L)).thenReturn(Optional.of(social));

        assertThatThrownBy(() -> userService.removeSocial(5L, other))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("only remove your own");
    }
}
