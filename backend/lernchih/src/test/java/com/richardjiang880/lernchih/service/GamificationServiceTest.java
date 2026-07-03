package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.LeaderboardEntry;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import com.richardjiang880.lernchih.repository.UpvoteRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
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
class GamificationServiceTest {

    @Mock
    private UpvoteRepository upvoteRepository;

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GamificationService gamificationService;

    @Test
    void toggleUpvoteAddsUpvoteAndCredits() {
        User user = User.builder().id(1L).credits(10).build();
        Resource resource = Resource.builder().id(1L).upvoteCount(5).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(upvoteRepository.existsByUserIdAndResourceId(1L, 1L)).thenReturn(false);
        when(upvoteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> inv.getArgument(0));

        boolean added = gamificationService.toggleUpvote(1L, user);

        assertThat(added).isTrue();
        assertThat(user.getCredits()).isEqualTo(12);
        assertThat(resource.getUpvoteCount()).isEqualTo(6);
    }

    @Test
    void toggleUpvoteRemovesUpvoteAndCredits() {
        User user = User.builder().id(1L).credits(10).build();
        Resource resource = Resource.builder().id(1L).upvoteCount(5).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(upvoteRepository.existsByUserIdAndResourceId(1L, 1L)).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> inv.getArgument(0));

        boolean removed = gamificationService.toggleUpvote(1L, user);

        assertThat(removed).isFalse();
        assertThat(user.getCredits()).isEqualTo(8);
        assertThat(resource.getUpvoteCount()).isEqualTo(4);
    }

    @Test
    void toggleUpvoteThrowsWhenResourceNotFound() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gamificationService.toggleUpvote(99L, User.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Resource not found");
    }

    @Test
    void getLeaderboardReturnsMappedEntries() {
        User user = User.builder().id(1L).name("Alice").email("alice@example.com").credits(100).build();
        when(userRepository.findTop50ByCreditsDesc()).thenReturn(List.of(user));

        List<LeaderboardEntry> entries = gamificationService.getLeaderboard();

        assertThat(entries).hasSize(1);
        assertThat(entries.get(0).credits()).isEqualTo(100);
    }
}
