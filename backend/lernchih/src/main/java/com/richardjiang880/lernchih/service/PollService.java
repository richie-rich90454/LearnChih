package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.PollDtos;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Poll lifecycle: create a poll with options, cast a vote (one vote per user
 * per poll), and read results.
 */
@Service
public class PollService {

    private final PollRepository pollRepository;
    private final PollOptionRepository pollOptionRepository;
    private final PollVoteRepository pollVoteRepository;

    public PollService(PollRepository pollRepository,
                       PollOptionRepository pollOptionRepository,
                       PollVoteRepository pollVoteRepository) {
        this.pollRepository = pollRepository;
        this.pollOptionRepository = pollOptionRepository;
        this.pollVoteRepository = pollVoteRepository;
    }

    @Transactional
    public PollDtos.PollResponse createPoll(PollDtos.CreatePollRequest request) {
        PostType postType = parsePostType(request.postType());
        if (request.options() == null || request.options().size() < 2) {
            throw new IllegalArgumentException("A poll must have at least two options");
        }

        Poll poll = Poll.builder()
                .postId(request.postId())
                .postType(postType)
                .question(request.question())
                .build();

        List<PollOption> options = new ArrayList<>();
        for (String text : request.options()) {
            PollOption opt = PollOption.builder()
                    .poll(poll)
                    .text(text)
                    .voteCount(0)
                    .build();
            options.add(opt);
        }
        poll.setOptions(options);

        poll = pollRepository.save(poll);
        return toResponse(poll);
    }

    @Transactional(readOnly = true)
    public PollDtos.PollResponse getPoll(Long pollId) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found"));
        return toResponse(poll);
    }

    @Transactional(readOnly = true)
    public PollDtos.PollResponse getPollForPost(Long postId, String postTypeStr) {
        PostType postType = parsePostType(postTypeStr);
        Poll poll = pollRepository.findByPostIdAndPostType(postId, postType)
                .orElseThrow(() -> new IllegalArgumentException("No poll for this post"));
        return toResponse(poll);
    }

    @Transactional
    public PollDtos.PollResponse vote(Long pollId, Long optionId, User user) {
        Poll poll = pollRepository.findById(pollId)
                .orElseThrow(() -> new IllegalArgumentException("Poll not found"));

        if (pollVoteRepository.existsByUserIdAndPollId(user.getId(), pollId)) {
            throw new IllegalStateException("User has already voted in this poll");
        }

        PollOption option = poll.getOptions().stream()
                .filter(o -> o.getId().equals(optionId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Option does not belong to this poll"));

        PollVote vote = PollVote.builder()
                .poll(poll)
                .option(option)
                .user(user)
                .build();
        pollVoteRepository.save(vote);

        option.setVoteCount(option.getVoteCount() + 1);
        pollOptionRepository.save(option);

        return toResponse(poll);
    }

    private PollDtos.PollResponse toResponse(Poll poll) {
        List<PollDtos.PollOptionResponse> options = poll.getOptions().stream()
                .map(o -> new PollDtos.PollOptionResponse(o.getId(), o.getText(), o.getVoteCount()))
                .toList();
        return new PollDtos.PollResponse(
                poll.getId(), poll.getPostId(), poll.getPostType().name(),
                poll.getQuestion(), options, poll.getCreatedAt());
    }

    private PostType parsePostType(String postType) {
        if (postType == null || postType.isBlank()) {
            return PostType.RESOURCE;
        }
        try {
            return PostType.valueOf(postType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid postType: " + postType);
        }
    }
}
