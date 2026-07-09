package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.AbstractControllerIntegrationTest;
import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.UserSocial;
import com.richardjiang880.lernchih.repository.SubjectRepository;
import com.richardjiang880.lernchih.repository.UserSocialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserControllerIT extends AbstractControllerIntegrationTest {

    @Autowired
    private SubjectRepository subjectRepository;
    @Autowired
    private UserSocialRepository userSocialRepository;

    @BeforeEach
    void cleanUp() {
        userSocialRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void getMyProfileRequiresAuthentication() {
        ResponseEntity<String> anonymous = restTemplate.getForEntity("/api/users/me", String.class);
        assertThat(anonymous.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        ResponseEntity<UserProfileResponse> authenticated = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(token)),
                UserProfileResponse.class);

        assertThat(authenticated.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(authenticated.getBody()).isNotNull();
        assertThat(authenticated.getBody().email()).isEqualTo("alice@example.com");
    }

    @Test
    void getProfileByIdIsPublic() {
        createVerifiedUser("alice@example.com", "Alice", Role.STUDENT);
        User user = userRepository.findByEmail("alice@example.com").orElseThrow();

        ResponseEntity<UserProfileResponse> response = restTemplate.getForEntity(
                "/api/users/" + user.getId(), UserProfileResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Alice");
    }

    @Test
    void updateProfile() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        ResponseEntity<UserProfileResponse> response = restTemplate.exchange(
                "/api/users/me",
                HttpMethod.PUT,
                new HttpEntity<>(new UpdateProfileRequest("Alice Updated", "New bio", null, null, null), authHeaders(token)),
                UserProfileResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().name()).isEqualTo("Alice Updated");
        assertThat(response.getBody().bio()).isEqualTo("New bio");
    }

    @Test
    void updateSubjects() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);
        Subject math = subjectRepository.save(Subject.builder().name("Mathematics").build());
        Subject physics = subjectRepository.save(Subject.builder().name("Physics").build());

        ResponseEntity<UserProfileResponse> response = restTemplate.exchange(
                "/api/users/me/subjects",
                HttpMethod.PUT,
                new HttpEntity<>(List.of(math.getId(), physics.getId()), authHeaders(token)),
                UserProfileResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().subjects()).containsExactly("Mathematics", "Physics");
    }

    @Test
    void addAndRemoveSocial() {
        String token = registerAndVerify("alice@example.com", "Alice", Role.STUDENT);

        ResponseEntity<UserSocialDto> addResponse = restTemplate.exchange(
                "/api/users/me/socials",
                HttpMethod.POST,
                new HttpEntity<>(new UserSocialRequest("github", "https://github.com/alice"), authHeaders(token)),
                UserSocialDto.class);

        assertThat(addResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(addResponse.getBody()).isNotNull();
        Long socialId = addResponse.getBody().id();

        ResponseEntity<Void> removeResponse = restTemplate.exchange(
                "/api/users/me/socials/" + socialId,
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(token)),
                Void.class);

        assertThat(removeResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);
        assertThat(userSocialRepository.findById(socialId)).isEmpty();
    }

    @Test
    void removeForeignSocialIsRejected() {
        User alice = createVerifiedUser("alice@example.com", "Alice", Role.STUDENT);
        User bob = createVerifiedUser("bob@example.com", "Bob", Role.STUDENT);
        UserSocial social = userSocialRepository.save(UserSocial.builder()
                .user(alice)
                .platform("github")
                .url("https://github.com/alice")
                .build());

        String bobToken = obtainAccessToken("bob@example.com");
        ResponseEntity<String> response = restTemplate.exchange(
                "/api/users/me/socials/" + social.getId(),
                HttpMethod.DELETE,
                new HttpEntity<>(authHeaders(bobToken)),
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).contains("only remove your own");
    }
}
