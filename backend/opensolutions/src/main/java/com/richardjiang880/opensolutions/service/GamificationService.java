package com.richardjiang880.opensolutions.service;

import com.richardjiang880.opensolutions.dto.LeaderboardEntry;
import com.richardjiang880.opensolutions.model.Resource;
import com.richardjiang880.opensolutions.model.Upvote;
import com.richardjiang880.opensolutions.model.User;
import com.richardjiang880.opensolutions.repository.ResourceRepository;
import com.richardjiang880.opensolutions.repository.UpvoteRepository;
import com.richardjiang880.opensolutions.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
/**
 * Service for gamification features including upvotes and leaderboard.
 */
public class GamificationService {

    private final UpvoteRepository upvoteRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public GamificationService(UpvoteRepository upvoteRepository,
                               ResourceRepository resourceRepository,
                               UserRepository userRepository) {
        this.upvoteRepository = upvoteRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public boolean toggleUpvote(Long resourceId, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        boolean alreadyUpvoted = upvoteRepository.existsByUserIdAndResourceId(currentUser.getId(), resourceId);

        if (alreadyUpvoted) {
            // Remove the upvote and deduct 2 credits
            upvoteRepository.deleteByUserIdAndResourceId(currentUser.getId(), resourceId);
            currentUser.setCredits(Math.max(0, currentUser.getCredits() - 2));
            userRepository.save(currentUser);

            // Decrement the resource's upvote count
            resource.setUpvoteCount(Math.max(0, resource.getUpvoteCount() - 1));
            resourceRepository.save(resource);

            return false; // upvote removed
        } else {
            // Add the upvote and award 2 credits
            Upvote upvote = Upvote.builder()
                    .user(currentUser)
                    .resource(resource)
                    .build();
            upvoteRepository.save(upvote);
            currentUser.setCredits(currentUser.getCredits() + 2);
            userRepository.save(currentUser);

            // Increment the resource's upvote count
            resource.setUpvoteCount(resource.getUpvoteCount() + 1);
            resourceRepository.save(resource);

            return true; // upvote added
        }
    }

    @Transactional(readOnly = true)
    // Returns top 50 users sorted by credits descending
    public List<LeaderboardEntry> getLeaderboard() {
        return userRepository.findTop50ByCreditsDesc().stream()
                .map(user -> new LeaderboardEntry(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getCredits()
                ))
                .toList();
    }
}
