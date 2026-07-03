package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.AbstractIntegrationTest;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void cleanUp() {
        userRepository.deleteAll();
    }

    @Test
    void findByEmailReturnsUserWhenExists() {
        User user = User.builder()
                .email("alice@example.com")
                .password("password")
                .name("Alice")
                .role(Role.STUDENT)
                .build();
        userRepository.save(user);

        assertThat(userRepository.findByEmail("alice@example.com"))
                .isPresent()
                .hasValueSatisfying(u -> assertThat(u.getName()).isEqualTo("Alice"));
    }

    @Test
    void findByEmailReturnsEmptyWhenNotExists() {
        assertThat(userRepository.findByEmail("missing@example.com")).isEmpty();
    }

    @Test
    void existsByEmailReturnsTrueForExistingEmail() {
        User user = User.builder()
                .email("bob@example.com")
                .password("password")
                .name("Bob")
                .role(Role.STUDENT)
                .build();
        userRepository.save(user);

        assertThat(userRepository.existsByEmail("bob@example.com")).isTrue();
    }

    @Test
    void existsByEmailReturnsFalseForUnknownEmail() {
        assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
    }

    @Test
    void findTop50ByCreditsDescOrdersUsersByCreditsDescending() {
        User lowCredits = User.builder()
                .email("low@example.com")
                .password("password")
                .name("Low")
                .role(Role.STUDENT)
                .credits(10)
                .build();
        User highCredits = User.builder()
                .email("high@example.com")
                .password("password")
                .name("High")
                .role(Role.STUDENT)
                .credits(100)
                .build();
        userRepository.save(lowCredits);
        userRepository.save(highCredits);

        List<User> topUsers = userRepository.findTop50ByCreditsDesc();

        assertThat(topUsers).hasSize(2);
        assertThat(topUsers.get(0).getCredits()).isEqualTo(100);
        assertThat(topUsers.get(1).getCredits()).isEqualTo(10);
    }
}
