package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.PollDtos;
import com.richardjiang880.lernchih.model.Poll;
import com.richardjiang880.lernchih.model.PollOption;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.PollOptionRepository;
import com.richardjiang880.lernchih.repository.PollRepository;
import com.richardjiang880.lernchih.repository.PollVoteRepository;
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
class PollServiceTest {

    @Mock
    private PollRepository pollRepository;

    @Mock
    private PollOptionRepository pollOptionRepository;

    @Mock
    private PollVoteRepository pollVoteRepository;

    @InjectMocks
    private PollService pollService;

    @Test
    void createPollSavesPollWithOptions() {
        PollDtos.CreatePollRequest request = new PollDtos.CreatePollRequest(1L, "RESOURCE", "Q1", List.of("A", "B"));
        when(pollRepository.save(any(Poll.class))).thenAnswer(inv -> {
            Poll p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PollDtos.PollResponse response = pollService.createPoll(request);

        assertThat(response.question()).isEqualTo("Q1");
        assertThat(response.options()).hasSize(2);
    }

    @Test
    void createPollThrowsWhenLessThanTwoOptions() {
        PollDtos.CreatePollRequest request = new PollDtos.CreatePollRequest(1L, "RESOURCE", "Q1", List.of("A"));

        assertThatThrownBy(() -> pollService.createPoll(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least two options");
    }

    @Test
    void getPollReturnsResponse() {
        Poll poll = Poll.builder().id(1L).postId(2L).postType(PostType.RESOURCE).question("Q1").build();
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));

        PollDtos.PollResponse response = pollService.getPoll(1L);

        assertThat(response.question()).isEqualTo("Q1");
    }

    @Test
    void getPollForPostReturnsResponse() {
        Poll poll = Poll.builder().id(1L).postId(2L).postType(PostType.RESOURCE).question("Q1").build();
        when(pollRepository.findByPostIdAndPostType(2L, PostType.RESOURCE)).thenReturn(Optional.of(poll));

        PollDtos.PollResponse response = pollService.getPollForPost(2L, "RESOURCE");

        assertThat(response.question()).isEqualTo("Q1");
    }

    @Test
    void voteRecordsVoteAndIncrementsCount() {
        PollOption option = PollOption.builder().id(10L).text("A").voteCount(0).build();
        Poll poll = Poll.builder().id(1L).postId(2L).postType(PostType.RESOURCE).question("Q1")
                .options(List.of(option)).build();
        User user = User.builder().id(5L).build();
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(pollVoteRepository.existsByUserIdAndPollId(5L, 1L)).thenReturn(false);
        when(pollVoteRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(pollOptionRepository.save(any(PollOption.class))).thenAnswer(inv -> inv.getArgument(0));

        PollDtos.PollResponse response = pollService.vote(1L, 10L, user);

        assertThat(option.getVoteCount()).isEqualTo(1);
        assertThat(response.question()).isEqualTo("Q1");
    }

    @Test
    void voteThrowsWhenAlreadyVoted() {
        Poll poll = Poll.builder().id(1L).postId(2L).postType(PostType.RESOURCE).question("Q1").build();
        User user = User.builder().id(5L).build();
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(pollVoteRepository.existsByUserIdAndPollId(5L, 1L)).thenReturn(true);

        assertThatThrownBy(() -> pollService.vote(1L, 10L, user))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already voted");
    }

    @Test
    void voteThrowsForInvalidOption() {
        Poll poll = Poll.builder().id(1L).postId(2L).postType(PostType.RESOURCE).question("Q1").options(List.of()).build();
        User user = User.builder().id(5L).build();
        when(pollRepository.findById(1L)).thenReturn(Optional.of(poll));
        when(pollVoteRepository.existsByUserIdAndPollId(5L, 1L)).thenReturn(false);

        assertThatThrownBy(() -> pollService.vote(1L, 10L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Option does not belong");
    }
}
