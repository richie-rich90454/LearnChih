package com.richardjiang880.lernchih.security;

import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collection;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserDetailsServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailsService userDetailsService;

    @Test
    void loadUserByUsernameReturnsEnabledUserDetails() {
        User user = User.builder()
                .id(1L)
                .email("alice@example.com")
                .password("encoded")
                .verified(true)
                .role(Role.STUDENT)
                .build();
        when(userRepository.findByEmail("alice@example.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("alice@example.com");

        assertThat(details.getUsername()).isEqualTo("alice@example.com");
        assertThat(details.getPassword()).isEqualTo("encoded");
        assertThat(details.isEnabled()).isTrue();
        assertThat((Collection<GrantedAuthority>) details.getAuthorities()).containsExactly(new SimpleGrantedAuthority("ROLE_STUDENT"));
    }

    @Test
    void loadUserByUsernameReturnsDisabledForUnverifiedUser() {
        User user = User.builder()
                .email("bob@example.com")
                .password("encoded")
                .verified(false)
                .role(Role.ADMIN)
                .build();
        when(userRepository.findByEmail("bob@example.com")).thenReturn(Optional.of(user));

        UserDetails details = userDetailsService.loadUserByUsername("bob@example.com");

        assertThat(details.isEnabled()).isFalse();
        assertThat((Collection<GrantedAuthority>) details.getAuthorities()).containsExactly(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    @Test
    void loadUserByUsernameThrowsWhenUserNotFound() {
        when(userRepository.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userDetailsService.loadUserByUsername("missing@example.com"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessageContaining("User not found with email");
    }
}
