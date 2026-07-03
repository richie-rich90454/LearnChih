package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.StudyGroupRequest;
import com.richardjiang880.lernchih.dto.StudyGroupResponse;
import com.richardjiang880.lernchih.model.StudyGroup;
import com.richardjiang880.lernchih.model.StudyGroupMember;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.StudyGroupMemberRepository;
import com.richardjiang880.lernchih.repository.StudyGroupRepository;
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
class StudyGroupServiceTest {

    @Mock
    private StudyGroupRepository studyGroupRepository;

    @Mock
    private StudyGroupMemberRepository studyGroupMemberRepository;

    @InjectMocks
    private StudyGroupService studyGroupService;

    @Test
    void listAllReturnsMappedResponses() {
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").description("Math group").ownerUserId(2L).build();
        when(studyGroupRepository.findAll()).thenReturn(List.of(group));
        when(studyGroupMemberRepository.findByGroupId(1L)).thenReturn(List.of(StudyGroupMember.builder().build()));

        List<StudyGroupResponse> responses = studyGroupService.listAll();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).name()).isEqualTo("Math");
        assertThat(responses.get(0).memberCount()).isEqualTo(1L);
    }

    @Test
    void getGroupReturnsResponse() {
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").ownerUserId(2L).build();
        when(studyGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(studyGroupMemberRepository.findByGroupId(1L)).thenReturn(List.of());

        StudyGroupResponse response = studyGroupService.getGroup(1L);

        assertThat(response.name()).isEqualTo("Math");
    }

    @Test
    void getGroupThrowsWhenNotFound() {
        when(studyGroupRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> studyGroupService.getGroup(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Study group not found");
    }

    @Test
    void createGroupSavesGroupAndOwnerMembership() {
        User user = User.builder().id(2L).build();
        StudyGroupRequest request = new StudyGroupRequest("Math", "Math group");
        when(studyGroupRepository.save(any(StudyGroup.class))).thenAnswer(inv -> {
            StudyGroup g = inv.getArgument(0);
            g.setId(1L);
            return g;
        });
        when(studyGroupMemberRepository.save(any(StudyGroupMember.class))).thenAnswer(inv -> inv.getArgument(0));
        when(studyGroupMemberRepository.findByGroupId(1L)).thenReturn(List.of(StudyGroupMember.builder().build()));

        StudyGroupResponse response = studyGroupService.createGroup(request, user);

        assertThat(response.name()).isEqualTo("Math");
        assertThat(response.ownerUserId()).isEqualTo(2L);
        verify(studyGroupMemberRepository).save(any(StudyGroupMember.class));
    }

    @Test
    void joinGroupAddsMembership() {
        User user = User.builder().id(3L).build();
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").ownerUserId(2L).build();
        when(studyGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(studyGroupMemberRepository.findByGroupIdAndUserId(1L, 3L)).thenReturn(Optional.empty());
        when(studyGroupMemberRepository.save(any(StudyGroupMember.class))).thenAnswer(inv -> inv.getArgument(0));
        when(studyGroupMemberRepository.findByGroupId(1L)).thenReturn(List.of(StudyGroupMember.builder().build()));

        StudyGroupResponse response = studyGroupService.joinGroup(1L, user);

        assertThat(response.name()).isEqualTo("Math");
        verify(studyGroupMemberRepository).save(any(StudyGroupMember.class));
    }

    @Test
    void joinGroupThrowsWhenAlreadyMember() {
        User user = User.builder().id(3L).build();
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").ownerUserId(2L).build();
        when(studyGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(studyGroupMemberRepository.findByGroupIdAndUserId(1L, 3L)).thenReturn(Optional.of(StudyGroupMember.builder().build()));

        assertThatThrownBy(() -> studyGroupService.joinGroup(1L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Already a member");
    }

    @Test
    void leaveGroupRemovesMembership() {
        User user = User.builder().id(3L).build();
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").ownerUserId(2L).build();
        StudyGroupMember member = StudyGroupMember.builder().build();
        when(studyGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(studyGroupMemberRepository.findByGroupIdAndUserId(1L, 3L)).thenReturn(Optional.of(member));

        studyGroupService.leaveGroup(1L, user);

        verify(studyGroupMemberRepository).delete(member);
    }

    @Test
    void leaveGroupThrowsForOwner() {
        User user = User.builder().id(2L).build();
        StudyGroup group = StudyGroup.builder().id(1L).name("Math").ownerUserId(2L).build();
        when(studyGroupRepository.findById(1L)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> studyGroupService.leaveGroup(1L, user))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Owner cannot leave");
    }
}
