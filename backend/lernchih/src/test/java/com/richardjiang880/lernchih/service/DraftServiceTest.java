package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.DraftDtos;
import com.richardjiang880.lernchih.model.Draft;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.DraftRepository;
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
class DraftServiceTest {

    @Mock
    private DraftRepository draftRepository;

    @InjectMocks
    private DraftService draftService;

    @Test
    void saveDraftCreatesAndReturnsResponse() {
        User user = User.builder().id(1L).build();
        DraftDtos.DraftRequest request = new DraftDtos.DraftRequest(10L, "RESOURCE", "Title", "Content");
        when(draftRepository.save(any(Draft.class))).thenAnswer(inv -> {
            Draft d = inv.getArgument(0);
            d.setId(100L);
            return d;
        });

        DraftDtos.DraftResponse response = draftService.saveDraft(request, user);

        assertThat(response.userId()).isEqualTo(1L);
        assertThat(response.postType()).isEqualTo("RESOURCE");
        assertThat(response.title()).isEqualTo("Title");
    }

    @Test
    void saveDraftToleratesBlankPostType() {
        User user = User.builder().id(1L).build();
        DraftDtos.DraftRequest request = new DraftDtos.DraftRequest(10L, "   ", "Title", "Content");
        when(draftRepository.save(any(Draft.class))).thenAnswer(inv -> inv.getArgument(0));

        DraftDtos.DraftResponse response = draftService.saveDraft(request, user);

        assertThat(response.postType()).isNull();
    }

    @Test
    void listDraftsReturnsUserDrafts() {
        User user = User.builder().id(1L).build();
        Draft draft = Draft.builder().id(1L).user(user).postId(10L).postType(PostType.RESOURCE).title("T").content("C").build();
        when(draftRepository.findByUserIdOrderByUpdatedAtDesc(1L)).thenReturn(List.of(draft));

        List<DraftDtos.DraftResponse> responses = draftService.listDrafts(user);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).title()).isEqualTo("T");
    }

    @Test
    void deleteDraftRemovesOwnedDraft() {
        User user = User.builder().id(1L).build();
        Draft draft = Draft.builder().id(1L).user(user).build();
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        draftService.deleteDraft(1L, user);

        verify(draftRepository).delete(draft);
    }

    @Test
    void deleteDraftThrowsForForeignDraft() {
        User owner = User.builder().id(1L).build();
        User other = User.builder().id(2L).build();
        Draft draft = Draft.builder().id(1L).user(owner).build();
        when(draftRepository.findById(1L)).thenReturn(Optional.of(draft));

        assertThatThrownBy(() -> draftService.deleteDraft(1L, other))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("another user's draft");
    }
}
