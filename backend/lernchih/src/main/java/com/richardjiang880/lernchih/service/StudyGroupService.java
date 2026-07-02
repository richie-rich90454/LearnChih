package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.StudyGroupRequest;
import com.richardjiang880.lernchih.dto.StudyGroupResponse;
import com.richardjiang880.lernchih.model.StudyGroup;
import com.richardjiang880.lernchih.model.StudyGroupMember;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.StudyGroupMemberRepository;
import com.richardjiang880.lernchih.repository.StudyGroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;
    private final StudyGroupMemberRepository studyGroupMemberRepository;

    public StudyGroupService(StudyGroupRepository studyGroupRepository,
                             StudyGroupMemberRepository studyGroupMemberRepository) {
        this.studyGroupRepository = studyGroupRepository;
        this.studyGroupMemberRepository = studyGroupMemberRepository;
    }

    @Transactional(readOnly = true)
    public List<StudyGroupResponse> listAll() {
        return studyGroupRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StudyGroupResponse getGroup(Long id) {
        StudyGroup group = studyGroupRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Study group not found"));
        return toResponse(group);
    }

    @Transactional
    public StudyGroupResponse createGroup(StudyGroupRequest request, User user) {
        StudyGroup group = StudyGroup.builder()
                .name(request.name())
                .description(request.description())
                .ownerUserId(user.getId())
                .build();
        group = studyGroupRepository.save(group);

        // Owner is automatically a member
        StudyGroupMember ownerMembership = StudyGroupMember.builder()
                .groupId(group.getId())
                .userId(user.getId())
                .build();
        studyGroupMemberRepository.save(ownerMembership);

        return toResponse(group);
    }

    @Transactional
    public StudyGroupResponse joinGroup(Long groupId, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Study group not found"));

        if (studyGroupMemberRepository.findByGroupIdAndUserId(groupId, user.getId()).isPresent()) {
            throw new IllegalArgumentException("Already a member of this group");
        }

        StudyGroupMember membership = StudyGroupMember.builder()
                .groupId(groupId)
                .userId(user.getId())
                .build();
        studyGroupMemberRepository.save(membership);

        return toResponse(group);
    }

    @Transactional
    public void leaveGroup(Long groupId, User user) {
        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Study group not found"));

        if (group.getOwnerUserId().equals(user.getId())) {
            throw new IllegalArgumentException("Owner cannot leave the group; transfer ownership or delete the group");
        }

        StudyGroupMember membership = studyGroupMemberRepository.findByGroupIdAndUserId(groupId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Not a member of this group"));
        studyGroupMemberRepository.delete(membership);
    }

    private StudyGroupResponse toResponse(StudyGroup group) {
        long memberCount = studyGroupMemberRepository.findByGroupId(group.getId()).size();
        return new StudyGroupResponse(
                group.getId(),
                group.getName(),
                group.getDescription(),
                group.getOwnerUserId(),
                group.getCreatedAt(),
                memberCount
        );
    }
}
