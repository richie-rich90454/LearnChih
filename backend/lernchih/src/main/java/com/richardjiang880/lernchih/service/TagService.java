package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.TagDtos;
import com.richardjiang880.lernchih.model.PostTag;
import com.richardjiang880.lernchih.model.PostType;
import com.richardjiang880.lernchih.model.Tag;
import com.richardjiang880.lernchih.repository.PostTagRepository;
import com.richardjiang880.lernchih.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Create/list tags and assign/remove them from posts (polymorphic).
 */
@Service
public class TagService {

    private final TagRepository tagRepository;
    private final PostTagRepository postTagRepository;

    public TagService(TagRepository tagRepository, PostTagRepository postTagRepository) {
        this.tagRepository = tagRepository;
        this.postTagRepository = postTagRepository;
    }

    @Transactional
    public TagDtos.TagResponse createTag(TagDtos.CreateTagRequest request) {
        String name = request.name() == null ? null : request.name().trim();
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tag name is required");
        }
        Tag tag = tagRepository.findByName(name).orElseGet(() -> Tag.builder().name(name).build());
        tag = tagRepository.save(tag);
        return new TagDtos.TagResponse(tag.getId(), tag.getName());
    }

    @Transactional(readOnly = true)
    public List<TagDtos.TagResponse> listTags() {
        return tagRepository.findAll().stream()
                .map(t -> new TagDtos.TagResponse(t.getId(), t.getName()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TagDtos.TagResponse> listTagsForPost(Long postId, String postTypeStr) {
        PostType postType = parsePostType(postTypeStr);
        return postTagRepository.findByPostIdAndPostType(postId, postType).stream()
                .map(pt -> new TagDtos.TagResponse(pt.getTag().getId(), pt.getTag().getName()))
                .toList();
    }

    @Transactional
    public TagDtos.TagResponse assignToPost(Long postId, String postTypeStr, TagDtos.AssignTagRequest request) {
        PostType postType = parsePostType(postTypeStr);
        Tag tag = tagRepository.findById(request.tagId())
                .orElseThrow(() -> new IllegalArgumentException("Tag not found"));
        if (!postTagRepository.existsByPostIdAndPostTypeAndTagId(postId, postType, tag.getId())) {
            PostTag postTag = PostTag.builder()
                    .postId(postId)
                    .postType(postType)
                    .tag(tag)
                    .build();
            postTagRepository.save(postTag);
        }
        return new TagDtos.TagResponse(tag.getId(), tag.getName());
    }

    @Transactional
    public void removeFromPost(Long postId, String postTypeStr, Long tagId) {
        PostType postType = parsePostType(postTypeStr);
        postTagRepository.deleteByPostIdAndPostTypeAndTagId(postId, postType, tagId);
    }

    private PostType parsePostType(String postType) {
        if (postType == null || postType.isBlank()) {
            return PostType.RESOURCE;
        }
        try {
            return PostType.valueOf(postType.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid postType: " + postType);
        }
    }
}
