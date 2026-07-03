package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.AbstractRepositoryTest;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class UserRepositoryJpaTest extends AbstractRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findByEmailReturnsUserWhenExists() {
        User user = persistUser("alice@example.com", "Alice", 5);

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
        persistUser("bob@example.com", "Bob", 0);

        assertThat(userRepository.existsByEmail("bob@example.com")).isTrue();
    }

    @Test
    void existsByEmailReturnsFalseForUnknownEmail() {
        assertThat(userRepository.existsByEmail("unknown@example.com")).isFalse();
    }

    @Test
    void findTop50ByCreditsDescOrdersUsersByCreditsDescending() {
        persistUser("low@example.com", "Low", 10);
        persistUser("high@example.com", "High", 100);

        List<User> topUsers = userRepository.findTop50ByCreditsDesc();

        assertThat(topUsers).hasSize(2);
        assertThat(topUsers.get(0).getCredits()).isEqualTo(100);
        assertThat(topUsers.get(1).getCredits()).isEqualTo(10);
    }

    private User persistUser(String email, String name, int credits) {
        User user = User.builder()
                .email(email)
                .password("password")
                .name(name)
                .role(Role.STUDENT)
                .credits(credits)
                .build();
        return entityManager.persistAndFlush(user);
    }
}
