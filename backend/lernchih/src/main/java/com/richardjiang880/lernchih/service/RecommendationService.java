package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.RecommendationDtos.RecommendationItem;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ResourceInteraction;
import com.richardjiang880.lernchih.repository.ResourceInteractionRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Content-based resource recommender (F23). Builds an affinity profile from
 * the resources a user has interacted with (subjects + categories weighted by
 * interaction count) and ranks unseen resources by similarity. When the user
 * has no interaction history, it falls back to the most recent resources so
 * the "Recommended for you" section is never empty on a fresh account.
 */
@Service
public class RecommendationService {

    private static final int MAX_RESULTS = 10;
    private static final int CANDIDATE_POOL = 100;

    private final ResourceRepository resourceRepository;
    private final ResourceInteractionRepository interactionRepository;

    public RecommendationService(ResourceRepository resourceRepository,
                                 ResourceInteractionRepository interactionRepository) {
        this.resourceRepository = resourceRepository;
        this.interactionRepository = interactionRepository;
    }

    @Transactional(readOnly = true)
    public List<RecommendationItem> recommend(Long userId) {
        List<ResourceInteraction> interactions =
                interactionRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // Affinity weights: subject matches count more than category matches.
        Map<Long, Double> subjectAffinity = new HashMap<>();
        Map<String, Double> categoryAffinity = new HashMap<>();
        Set<Long> interactedResourceIds = new HashSet<>();
        for (ResourceInteraction ix : interactions) {
            interactedResourceIds.add(ix.getResourceId());
            if (ix.getSubjectId() != null) {
                subjectAffinity.merge(ix.getSubjectId(), 2.0, Double::sum);
            }
            if (ix.getCategory() != null) {
                categoryAffinity.merge(ix.getCategory(), 1.0, Double::sum);
            }
        }

        List<Resource> candidates = resourceRepository
                .findAll(PageRequest.of(0, CANDIDATE_POOL))
                .getContent();

        // Exclude resources the user owns or has already interacted with.
        List<RecommendationItem> scored = candidates.stream()
                .filter(r -> !Objects.equals(r.getUser().getId(), userId))
                .filter(r -> !interactedResourceIds.contains(r.getId()))
                .map(r -> new AbstractMap.SimpleEntry<>(r, score(r, subjectAffinity, categoryAffinity)))
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(MAX_RESULTS)
                .map(e -> toItem(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        if (scored.isEmpty()) {
            // Fresh account / all candidates excluded: surface recent resources.
            return resourceRepository.findTop20ByOrderByCreatedAtDesc().stream()
                    .filter(r -> !Objects.equals(r.getUser().getId(), userId))
                    .limit(MAX_RESULTS)
                    .map(r -> toItem(r, 0.0))
                    .collect(Collectors.toList());
        }
        return scored;
    }

    /**
     * Records a VIEW interaction for the given resource, deduplicating so a
     * single view per (user, resource) pair is enough to inform the profile.
     */
    @Transactional
    public void recordView(Long userId, Resource resource) {
        if (interactionRepository.existsByUserIdAndResourceIdAndInteraction(
                userId, resource.getId(), ResourceInteraction.Interaction.VIEW)) {
            return;
        }
        interactionRepository.save(ResourceInteraction.builder()
                .userId(userId)
                .resourceId(resource.getId())
                .interaction(ResourceInteraction.Interaction.VIEW)
                .subjectId(resource.getSubject() != null ? resource.getSubject().getId() : null)
                .category(resource.getCategory() != null ? resource.getCategory().name() : null)
                .build());
    }

    private double score(Resource r, Map<Long, Double> subjectAffinity,
                         Map<String, Double> categoryAffinity) {
        double score = 0.0;
        if (r.getSubject() != null) {
            score += subjectAffinity.getOrDefault(r.getSubject().getId(), 0.0);
        }
        if (r.getCategory() != null) {
            score += categoryAffinity.getOrDefault(r.getCategory().name(), 0.0);
        }
        // Popularity tiebreaker so equally-similar resources favour upvoted ones.
        score += (r.getUpvoteCount() != null ? r.getUpvoteCount() : 0) * 0.01;
        return score;
    }

    private RecommendationItem toItem(Resource r, double score) {
        return new RecommendationItem(
                r.getId(),
                r.getSlug(),
                r.getTitle(),
                r.getDescription(),
                r.getCategory() != null ? r.getCategory().name() : null,
                r.getType() != null ? r.getType().name() : null,
                r.getSubject() != null ? r.getSubject().getId() : null,
                r.getSubject() != null ? r.getSubject().getName() : null,
                r.getUpvoteCount() != null ? r.getUpvoteCount() : 0,
                r.getUser() != null ? r.getUser().getName() : null,
                score,
                r.getCreatedAt()
        );
    }
}
