package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ContentVersionDtos;
import com.richardjiang880.lernchih.model.ContentVersion;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.repository.ContentVersionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentVersionServiceTest {

    @Mock
    private ContentVersionRepository contentVersionRepository;

    @Mock
    private ContentSanitizer contentSanitizer;

    @InjectMocks
    private ContentVersionService contentVersionService;

    @Test
    void saveVersionCreatesNewVersion() {
        User user = User.builder().id(1L).build();
        ContentVersionDtos.ContentVersionRequest request = new ContentVersionDtos.ContentVersionRequest("md", "html");
        when(contentVersionRepository.countByPostIdAndPostType(10L, PostType.RESOURCE)).thenReturn(2L);
        when(contentSanitizer.sanitize("html")).thenReturn("safe-html");
        when(contentVersionRepository.save(any(ContentVersion.class))).thenAnswer(inv -> {
            ContentVersion v = inv.getArgument(0);
            v.setId(100L);
            return v;
        });

        ContentVersionDtos.ContentVersionResponse response = contentVersionService.saveVersion(10L, "RESOURCE", request, user);

        assertThat(response.versionNumber()).isEqualTo(3);
        assertThat(response.contentHtml()).isEqualTo("safe-html");
        assertThat(response.createdBy()).isEqualTo(1L);
    }

    @Test
    void listVersionsReturnsPagedResponses() {
        User user = User.builder().id(1L).build();
        ContentVersion version = ContentVersion.builder()
                .id(100L).postId(10L).postType(PostType.RESOURCE).versionNumber(1)
                .contentMarkdown("md").contentHtml("html").createdBy(user).build();
        Page<ContentVersion> page = new PageImpl<>(List.of(version));
        when(contentVersionRepository.findByPostIdAndPostTypeOrderByVersionNumberDesc(10L, PostType.RESOURCE, PageRequest.of(0, 10)))
                .thenReturn(page);

        Page<ContentVersionDtos.ContentVersionResponse> responses = contentVersionService.listVersions(10L, "RESOURCE", PageRequest.of(0, 10));

        assertThat(responses.getContent()).hasSize(1);
        assertThat(responses.getContent().get(0).versionNumber()).isEqualTo(1);
    }
}
