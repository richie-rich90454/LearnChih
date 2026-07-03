package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.TagDtos;
import com.richardjiang880.lernchih.model.PostTag;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.Tag;
import com.richardjiang880.lernchih.repository.PostTagRepository;
import com.richardjiang880.lernchih.repository.TagRepository;
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
class TagServiceTest {

    @Mock
    private TagRepository tagRepository;

    @Mock
    private PostTagRepository postTagRepository;

    @InjectMocks
    private TagService tagService;

    @Test
    void createTagSavesNewTag() {
        when(tagRepository.findByName("java")).thenReturn(Optional.empty());
        when(tagRepository.save(any(Tag.class))).thenAnswer(inv -> {
            Tag t = inv.getArgument(0);
            t.setId(1L);
            return t;
        });

        TagDtos.TagResponse response = tagService.createTag(new TagDtos.CreateTagRequest("java"));

        assertThat(response.name()).isEqualTo("java");
    }

    @Test
    void createTagThrowsWhenNameBlank() {
        assertThatThrownBy(() -> tagService.createTag(new TagDtos.CreateTagRequest("   ")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Tag name is required");
    }

    @Test
    void listTagsReturnsAllTags() {
        Tag tag = Tag.builder().id(1L).name("java").build();
        when(tagRepository.findAll()).thenReturn(List.of(tag));

        List<TagDtos.TagResponse> responses = tagService.listTags();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).name()).isEqualTo("java");
    }

    @Test
    void listTagsForPostReturnsAssignedTags() {
        Tag tag = Tag.builder().id(1L).name("java").build();
        PostTag postTag = PostTag.builder().tag(tag).build();
        when(postTagRepository.findByPostIdAndPostType(10L, PostType.RESOURCE)).thenReturn(List.of(postTag));

        List<TagDtos.TagResponse> responses = tagService.listTagsForPost(10L, "RESOURCE");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).name()).isEqualTo("java");
    }

    @Test
    void assignToPostSavesNewAssignment() {
        Tag tag = Tag.builder().id(1L).name("java").build();
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(postTagRepository.existsByPostIdAndPostTypeAndTagId(10L, PostType.RESOURCE, 1L)).thenReturn(false);
        when(postTagRepository.save(any(PostTag.class))).thenAnswer(inv -> inv.getArgument(0));

        TagDtos.TagResponse response = tagService.assignToPost(10L, "RESOURCE", new TagDtos.AssignTagRequest(1L));

        assertThat(response.name()).isEqualTo("java");
        verify(postTagRepository).save(any(PostTag.class));
    }

    @Test
    void assignToPostSkipsExistingAssignment() {
        Tag tag = Tag.builder().id(1L).name("java").build();
        when(tagRepository.findById(1L)).thenReturn(Optional.of(tag));
        when(postTagRepository.existsByPostIdAndPostTypeAndTagId(10L, PostType.RESOURCE, 1L)).thenReturn(true);

        TagDtos.TagResponse response = tagService.assignToPost(10L, "RESOURCE", new TagDtos.AssignTagRequest(1L));

        assertThat(response.name()).isEqualTo("java");
        verify(postTagRepository, never()).save(any(PostTag.class));
    }

    @Test
    void removeFromPostDeletesAssignment() {
        tagService.removeFromPost(10L, "RESOURCE", 1L);

        verify(postTagRepository).deleteByPostIdAndPostTypeAndTagId(10L, PostType.RESOURCE, 1L);
    }
}
