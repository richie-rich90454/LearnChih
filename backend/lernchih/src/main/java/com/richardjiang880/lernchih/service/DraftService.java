package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.DraftDtos;
import com.richardjiang880.lernchih.model.Draft;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.DraftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Save, list, and delete a user's draft compositions.
 */
@Service
public class DraftService {

    private final DraftRepository draftRepository;

    public DraftService(DraftRepository draftRepository) {
        this.draftRepository = draftRepository;
    }

    @Transactional
    public DraftDtos.DraftResponse saveDraft(DraftDtos.DraftRequest request, User user) {
        Draft draft = Draft.builder()
                .user(user)
                .postId(request.postId())
                .postType(parsePostType(request.postType()))
                .title(request.title())
                .content(request.content())
                .build();
        draft = draftRepository.save(draft);
        return toResponse(draft);
    }

    @Transactional(readOnly = true)
    public List<DraftDtos.DraftResponse> listDrafts(User user) {
        return draftRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void deleteDraft(Long draftId, User user) {
        Draft draft = draftRepository.findById(draftId)
                .orElseThrow(() -> new IllegalArgumentException("Draft not found"));
        if (!draft.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete another user's draft");
        }
        draftRepository.delete(draft);
    }

    private DraftDtos.DraftResponse toResponse(Draft draft) {
        return new DraftDtos.DraftResponse(
                draft.getId(), draft.getUser().getId(), draft.getPostId(),
                draft.getPostType() != null ? draft.getPostType().name() : null,
                draft.getTitle(), draft.getContent(), draft.getUpdatedAt());
    }

    private PostType parsePostType(String postType) {
        if (postType == null || postType.isBlank()) {
            return null;
        }
        try {
            return PostType.valueOf(postType.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
