package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.GroupMessageDtos.GroupMessageResponse;
import com.richardjiang880.lernchih.dto.GroupMessageDtos.SendGroupMessageRequest;
import com.richardjiang880.lernchih.model.GroupMessage;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.GroupMessageRepository;
import com.richardjiang880.lernchih.repository.StudyGroupMemberRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for study-group chat messages (F32).
 */
@RestController
@RequestMapping("/api/study-groups/{id}/messages")
public class GroupMessageController {

    private final GroupMessageRepository groupMessageRepository;
    private final StudyGroupMemberRepository studyGroupMemberRepository;
    private final UserRepository userRepository;

    public GroupMessageController(GroupMessageRepository groupMessageRepository,
                                  StudyGroupMemberRepository studyGroupMemberRepository,
                                  UserRepository userRepository) {
        this.groupMessageRepository = groupMessageRepository;
        this.studyGroupMemberRepository = studyGroupMemberRepository;
        this.userRepository = userRepository;
    }

    /**
     * List all messages in the study group, oldest first. Only members may
     * read the chat.
     */
    @GetMapping
    public ResponseEntity<List<GroupMessageResponse>> listMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        User me = getUserFromDetails(userDetails);
        ensureMember(id, me.getId());

        List<GroupMessage> messages = groupMessageRepository.findByStudyGroupIdOrderBySentAtAsc(id);
        // Batch-resolve author names to avoid N+1 queries.
        Map<Long, String> nameCache = new HashMap<>();
        List<GroupMessageResponse> response = messages.stream().map(m -> {
            String name = nameCache.computeIfAbsent(m.getUserId(), uid ->
                    userRepository.findById(uid).map(User::getName).orElse("Unknown"));
            return new GroupMessageResponse(
                    m.getId(),
                    m.getStudyGroupId(),
                    m.getUserId(),
                    name,
                    m.getContent(),
                    m.getSentAt()
            );
        }).toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Post a new message to the study group chat. Only members may post.
     */
    @PostMapping
    public ResponseEntity<GroupMessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody SendGroupMessageRequest request) {
        User me = getUserFromDetails(userDetails);
        ensureMember(id, me.getId());

        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Message content cannot be empty");
        }

        GroupMessage message = GroupMessage.builder()
                .studyGroupId(id)
                .userId(me.getId())
                .content(request.content())
                .build();
        message = groupMessageRepository.save(message);

        return ResponseEntity.ok(new GroupMessageResponse(
                message.getId(),
                message.getStudyGroupId(),
                message.getUserId(),
                me.getName(),
                message.getContent(),
                message.getSentAt()
        ));
    }

    private void ensureMember(Long groupId, Long userId) {
        if (studyGroupMemberRepository.findByGroupIdAndUserId(groupId, userId).isEmpty()) {
            throw new IllegalArgumentException("You must be a member of this study group to use its chat");
        }
    }

    private User getUserFromDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalStateException("No authenticated user found");
        }
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
    }
}
