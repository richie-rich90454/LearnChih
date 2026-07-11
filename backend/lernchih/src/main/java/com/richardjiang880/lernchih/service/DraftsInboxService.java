package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.DraftItemDtos;
import com.richardjiang880.lernchih.model.Draft;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.DraftRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Unified drafts inbox: lists a user's draft compositions across
 * resource, channel, and standalone note drafts (F64).
 */
@Service
public class DraftsInboxService {

    private final DraftRepository draftRepository;

    public DraftsInboxService(DraftRepository draftRepository) {
        this.draftRepository = draftRepository;
    }

    @Transactional(readOnly = true)
    public List<DraftItemDtos.DraftItemResponse> listInbox(User user) {
        return draftRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    private DraftItemDtos.DraftItemResponse toResponse(Draft draft) {
        String contentType = draft.getPostType() != null ? draft.getPostType().name() : "NOTE";
        String title = draft.getTitle() != null && !draft.getTitle().isBlank()
                ? draft.getTitle()
                : "";
        return new DraftItemDtos.DraftItemResponse(
                draft.getId(), contentType, title, draft.getUpdatedAt());
    }
}
