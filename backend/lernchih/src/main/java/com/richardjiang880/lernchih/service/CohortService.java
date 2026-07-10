package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.CohortDtos;
import com.richardjiang880.lernchih.model.Cohort;
import com.richardjiang880.lernchih.model.CohortMember;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.CohortRole;
import com.richardjiang880.lernchih.repository.CohortMemberRepository;
import com.richardjiang880.lernchih.repository.CohortRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Cohort lifecycle (F40): create cohorts, join/leave, and list members.
 * The creator becomes the cohort LEADER; subsequent joiners are MEMBERs.
 */
@Service
public class CohortService {

    private final CohortRepository cohortRepository;
    private final CohortMemberRepository cohortMemberRepository;
    private final UserRepository userRepository;

    public CohortService(CohortRepository cohortRepository,
                         CohortMemberRepository cohortMemberRepository,
                         UserRepository userRepository) {
        this.cohortRepository = cohortRepository;
        this.cohortMemberRepository = cohortMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CohortDtos.CohortResponse> listAll(User viewer) {
        List<Cohort> cohorts = cohortRepository.findAllByOrderByCreatedAtDesc();
        return cohorts.stream().map(c -> toResponse(c, viewer)).toList();
    }

    @Transactional(readOnly = true)
    public CohortDtos.CohortResponse getCohort(Long id, User viewer) {
        Cohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found"));
        return toResponse(cohort, viewer);
    }

    @Transactional
    public CohortDtos.CohortResponse create(CohortDtos.CreateCohortRequest request, User creator) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Cohort name is required");
        }
        Cohort cohort = Cohort.builder()
                .name(request.name())
                .description(request.description())
                .subjectId(request.subjectId())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxMembers(request.maxMembers())
                .createdBy(creator.getId())
                .build();
        cohort = cohortRepository.save(cohort);

        CohortMember leader = CohortMember.builder()
                .cohortId(cohort.getId())
                .userId(creator.getId())
                .role(CohortRole.LEADER)
                .build();
        cohortMemberRepository.save(leader);

        return toResponse(cohort, creator);
    }

    @Transactional
    public CohortDtos.CohortResponse join(Long id, User user) {
        Cohort cohort = cohortRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cohort not found"));

        if (cohortMemberRepository.existsByCohortIdAndUserId(id, user.getId())) {
            return toResponse(cohort, user);
        }
        if (cohort.getMaxMembers() != null) {
            long current = cohortMemberRepository.countByCohortId(id);
            if (current >= cohort.getMaxMembers()) {
                throw new IllegalStateException("Cohort is full");
            }
        }
        CohortMember member = CohortMember.builder()
                .cohortId(id)
                .userId(user.getId())
                .role(CohortRole.MEMBER)
                .build();
        cohortMemberRepository.save(member);
        return toResponse(cohort, user);
    }

    @Transactional
    public void leave(Long id, User user) {
        cohortMemberRepository.findByCohortIdAndUserId(id, user.getId())
                .ifPresent(cohortMemberRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<CohortDtos.CohortMemberResponse> listMembers(Long id) {
        if (!cohortRepository.existsById(id)) {
            throw new IllegalArgumentException("Cohort not found");
        }
        List<CohortMember> members = cohortMemberRepository.findByCohortIdOrderByJoinedAtAsc(id);
        if (members.isEmpty()) {
            return List.of();
        }
        List<Long> userIds = members.stream().map(CohortMember::getUserId).toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(userIds).forEach(u -> nameById.put(u.getId(), u.getName()));

        return members.stream()
                .map(m -> new CohortDtos.CohortMemberResponse(
                        m.getId(),
                        m.getUserId(),
                        nameById.getOrDefault(m.getUserId(), "Unknown"),
                        m.getRole().name(),
                        m.getJoinedAt()))
                .toList();
    }

    private CohortDtos.CohortResponse toResponse(Cohort cohort, User viewer) {
        int count = (int) cohortMemberRepository.countByCohortId(cohort.getId());
        String role = cohortMemberRepository.findByCohortIdAndUserId(cohort.getId(), viewer.getId())
                .map(m -> m.getRole().name())
                .orElse(null);
        return new CohortDtos.CohortResponse(
                cohort.getId(),
                cohort.getName(),
                cohort.getDescription(),
                cohort.getSubjectId(),
                cohort.getStartDate(),
                cohort.getEndDate(),
                cohort.getMaxMembers(),
                count,
                role,
                cohort.getCreatedAt());
    }
}
