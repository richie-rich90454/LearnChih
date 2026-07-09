package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.MatchDtos;
import com.richardjiang880.lernchih.model.StudyBuddyMatch;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.MatchStatus;
import com.richardjiang880.lernchih.repository.FriendshipRepository;
import com.richardjiang880.lernchih.repository.StudyBuddyMatchRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Study-buddy matching engine (F39). Surfaces potential partners ranked by
 * overlap of shared subjects. Suggestions are persisted as
 * {@link StudyBuddyMatch} rows so a user can dismiss one and not see it again.
 *
 * <p>Scoring is intentionally simple and explainable: each shared subject
 * contributes 25 points, capped at 100. Users who are already friends with the
 * current user are excluded — the "Connect" button on the frontend sends a
 * friend request via F38, so surfacing existing friends would be noise.
 */
@Service
public class MatchingService {

    /** Points contributed per shared subject. */
    static final int POINTS_PER_SHARED_SUBJECT = 25;
    /** Maximum number of suggestions surfaced per call. */
    static final int MAX_SUGGESTIONS = 10;

    private final UserRepository userRepository;
    private final StudyBuddyMatchRepository matchRepository;
    private final FriendshipRepository friendshipRepository;

    public MatchingService(UserRepository userRepository,
                           StudyBuddyMatchRepository matchRepository,
                           FriendshipRepository friendshipRepository) {
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.friendshipRepository = friendshipRepository;
    }

    /**
     * Compute (and persist) fresh study-buddy suggestions for the given user.
     * Dismissed suggestions are preserved as DISMISSED and excluded from the
     * returned list.
     */
    @Transactional
    public List<MatchDtos.BuddySuggestion> suggestBuddies(User currentUser) {
        Set<Long> mySubjectIds = subjectIds(currentUser);
        if (mySubjectIds.isEmpty()) {
            return List.of();
        }

        // Already-friend user ids (either direction, any non-pending status we
        // also exclude pending so the user does not see someone they just
        // invited). We use findAcceptedByUserId which is sufficient.
        Set<Long> friendIds = friendshipRepository
                .findAcceptedByUserId(currentUser.getId()).stream()
                .map(f -> f.getRequesterId().equals(currentUser.getId())
                        ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toSet());

        List<User> candidates = userRepository.findAll().stream()
                .filter(u -> !Objects.equals(u.getId(), currentUser.getId()))
                .filter(u -> !friendIds.contains(u.getId()))
                .toList();

        // Compute scores and persist SUGGESTED rows for any new pair.
        List<ScoredCandidate> scored = candidates.stream()
                .map(u -> {
                    int shared = intersectionSize(mySubjectIds, subjectIds(u));
                    if (shared == 0) {
                        return null;
                    }
                    int score = Math.min(100, shared * POINTS_PER_SHARED_SUBJECT);
                    return new ScoredCandidate(u, shared, score);
                })
                .filter(Objects::nonNull)
                .sorted((a, b) -> Integer.compare(b.score, a.score))
                .limit(MAX_SUGGESTIONS)
                .toList();

        // Bulk-load buddy names in one round-trip.
        List<Long> buddyIds = scored.stream().map(s -> s.user.getId()).toList();
        Map<Long, String> nameById = buddyIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(buddyIds).stream()
                    .collect(Collectors.toMap(User::getId, User::getName, (a, b) -> a));

        return scored.stream()
                .map(s -> {
                    StudyBuddyMatch existing = matchRepository
                            .findByUserIdAndBuddyId(currentUser.getId(), s.user.getId())
                            .orElse(null);
                    StudyBuddyMatch row;
                    if (existing == null) {
                        row = StudyBuddyMatch.builder()
                                .userId(currentUser.getId())
                                .buddyId(s.user.getId())
                                .matchScore(s.score)
                                .status(MatchStatus.SUGGESTED)
                                .build();
                        row = matchRepository.save(row);
                    } else if (existing.getStatus() == MatchStatus.DISMISSED) {
                        // Keep dismissed rows hidden but refresh their score.
                        existing.setMatchScore(s.score);
                        matchRepository.save(existing);
                        return null; // filtered out below
                    } else {
                        existing.setMatchScore(s.score);
                        row = matchRepository.save(existing);
                    }
                    return new MatchDtos.BuddySuggestion(
                            row.getId(),
                            s.user.getId(),
                            nameById.getOrDefault(s.user.getId(), s.user.getName()),
                            row.getMatchScore(),
                            s.shared,
                            row.getStatus().name()
                    );
                })
                .filter(Objects::nonNull)
                .toList();
    }

    /**
     * Mark a suggestion as dismissed so it does not reappear.
     */
    @Transactional
    public void dismiss(User currentUser, Long matchId) {
        StudyBuddyMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found"));
        if (!match.getUserId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Cannot dismiss another user's match");
        }
        match.setStatus(MatchStatus.DISMISSED);
        matchRepository.save(match);
    }

    /**
     * Mark a suggestion as CONNECTED (the user pressed Connect and a friend
     * request was sent via F38). The row is kept for history but no longer
     * surfaced as a fresh suggestion.
     */
    @Transactional
    public void markConnected(User currentUser, Long buddyId) {
        matchRepository.findByUserIdAndBuddyId(currentUser.getId(), buddyId)
                .ifPresent(m -> {
                    m.setStatus(MatchStatus.CONNECTED);
                    matchRepository.save(m);
                });
    }

    private Set<Long> subjectIds(User user) {
        if (user.getSubjects() == null) {
            return new HashSet<>();
        }
        return user.getSubjects().stream()
                .map(Subject::getId)
                .collect(Collectors.toSet());
    }

    private int intersectionSize(Set<Long> a, Set<Long> b) {
        int count = 0;
        for (Long id : a) {
            if (b.contains(id)) {
                count++;
            }
        }
        return count;
    }

    private record ScoredCandidate(User user, int shared, int score) {}
}
