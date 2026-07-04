package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;
    @Mock
    private ResourceThreadRepository resourceThreadRepository;
    @Mock
    private ResourcePostRepository resourcePostRepository;
    @Mock
    private UpvoteRepository upvoteRepository;
    @Mock
    private SubjectRepository subjectRepository;
    @Mock
    private TopicRepository topicRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private FileValidator fileValidator;
    @Mock
    private ContentSanitizer contentSanitizer;

    private ResourceService resourceService;

    @BeforeEach
    void setUp() throws Exception {
        resourceService = new ResourceService(resourceRepository, resourceThreadRepository, resourcePostRepository,
                upvoteRepository, subjectRepository, topicRepository, courseRepository, fileValidator, contentSanitizer);
        Path tempDir = Files.createTempDirectory("lernchih-uploads-test");
        ReflectionTestUtils.setField(resourceService, "uploadDir", tempDir.toString());
    }

    @Test
    void createResourceForLinkType() {
        User user = User.builder().id(1L).credits(0).build();
        CreateResourceRequest request = new CreateResourceRequest();
        request.setTitle("A Title");
        request.setDescription("<p>Desc</p>");
        request.setCategory(ResourceCategory.ARTICLE);
        request.setType(ResourceType.LINK);
        request.setExternalUrl("https://example.com");

        when(contentSanitizer.sanitizePlain("A Title")).thenReturn("A Title");
        when(contentSanitizer.sanitize("<p>Desc</p>")).thenReturn("<p>Desc</p>");
        when(resourceRepository.existsBySlug(anyString())).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> {
            Resource r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(resourceThreadRepository.save(any(ResourceThread.class))).thenAnswer(inv -> inv.getArgument(0));

        Resource result = resourceService.createResource(request, null, user);

        assertThat(result.getTitle()).isEqualTo("A Title");
        assertThat(result.getType()).isEqualTo(ResourceType.LINK);
        assertThat(result.getExternalUrl()).isEqualTo("https://example.com");
        assertThat(user.getCredits()).isEqualTo(10);
        verify(resourceThreadRepository).save(any(ResourceThread.class));
    }

    @Test
    void createResourceForUploadTypeRequiresFile() {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setType(ResourceType.UPLOAD);

        assertThatThrownBy(() -> resourceService.createResource(request, null, User.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("File is required");
    }

    @Test
    void createResourceForLinkTypeRequiresUrl() {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setType(ResourceType.LINK);
        request.setExternalUrl("  ");

        assertThatThrownBy(() -> resourceService.createResource(request, null, User.builder().build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("External URL is required");
    }

    @Test
    void createResourceHandlesSlugCollision() {
        User user = User.builder().id(1L).credits(0).build();
        CreateResourceRequest request = new CreateResourceRequest();
        request.setTitle("Title");
        request.setDescription("Desc");
        request.setCategory(ResourceCategory.ARTICLE);
        request.setType(ResourceType.LINK);
        request.setExternalUrl("https://example.com");

        when(contentSanitizer.sanitizePlain("Title")).thenReturn("Title");
        when(contentSanitizer.sanitize("Desc")).thenReturn("Desc");
        when(resourceRepository.existsBySlug("title")).thenReturn(true);
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> {
            Resource r = inv.getArgument(0);
            r.setId(7L);
            return r;
        });
        when(resourceThreadRepository.save(any(ResourceThread.class))).thenAnswer(inv -> inv.getArgument(0));

        Resource result = resourceService.createResource(request, null, user);

        assertThat(result.getSlug()).isEqualTo("title-7");
    }

    @Test
    void createResourceWithUploadSavesFile() throws Exception {
        User user = User.builder().id(1L).credits(0).build();
        CreateResourceRequest request = new CreateResourceRequest();
        request.setTitle("File");
        request.setDescription("Desc");
        request.setCategory(ResourceCategory.OTHER);
        request.setType(ResourceType.UPLOAD);
        byte[] content = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        MultipartFile file = new MockMultipartFile("file", "image.png", "image/png", content);

        when(contentSanitizer.sanitizePlain("File")).thenReturn("File");
        when(contentSanitizer.sanitize("Desc")).thenReturn("Desc");
        when(fileValidator.validate(file)).thenReturn("png");
        when(resourceRepository.existsBySlug(anyString())).thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> {
            Resource r = inv.getArgument(0);
            r.setId(1L);
            return r;
        });
        when(resourceThreadRepository.save(any(ResourceThread.class))).thenAnswer(inv -> inv.getArgument(0));

        Resource result = resourceService.createResource(request, file, user);

        assertThat(result.getFilePath()).isNotBlank();
        assertThat(result.getFilePath()).endsWith(".png");
    }

    @Test
    void getResourcesReturnsPageWithoutFilters() {
        Pageable pageable = PageRequest.of(0, 10);
        User user = User.builder().id(1L).build();
        Resource resource = Resource.builder().id(1L).title("R").user(user).build();
        when(resourceRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(resource)));

        Page<Resource> result = resourceService.getResources(pageable, null, null);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void getResourcesUsesFiltersWhenProvided() {
        Pageable pageable = PageRequest.of(0, 10);
        User user = User.builder().id(1L).build();
        Resource resource = Resource.builder().id(1L).title("R").user(user).build();
        when(resourceRepository.findWithFilters(1L, ResourceCategory.ARTICLE, pageable))
                .thenReturn(new PageImpl<>(List.of(resource)));

        Page<Resource> result = resourceService.getResources(pageable, 1L, ResourceCategory.ARTICLE);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void getResourceDetailReturnsMappedResponse() {
        User user = User.builder().id(1L).name("Alice").build();
        Resource resource = Resource.builder()
                .id(1L)
                .slug("slug")
                .title("Title")
                .description("Desc")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .upvoteCount(5)
                .build();
        ResourceThread thread = ResourceThread.builder().id(10L).resource(resource).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));
        when(resourceThreadRepository.findByResourceId(1L)).thenReturn(Optional.of(thread));
        when(resourcePostRepository.findByThreadIdOrderByCreatedAtAsc(10L, Pageable.unpaged()))
                .thenReturn(Page.empty());
        when(upvoteRepository.existsByUserIdAndResourceId(2L, 1L)).thenReturn(true);

        ResourceDetailResponse response = resourceService.getResourceDetail(1L, 2L);

        assertThat(response.title()).isEqualTo("Title");
        assertThat(response.upvoteCount()).isEqualTo(5);
        assertThat(response.upvotedByMe()).isTrue();
    }

    @Test
    void deleteResourceAllowsAdmin() {
        User admin = User.builder().id(1L).role(Role.ADMIN).build();
        User owner = User.builder().id(2L).role(Role.STUDENT).build();
        Resource resource = Resource.builder().id(1L).user(owner).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        resourceService.deleteResource(1L, admin);

        verify(resourceRepository).delete(resource);
    }

    @Test
    void deleteResourceAllowsModerator() {
        User moderator = User.builder().id(1L).role(Role.MODERATOR).build();
        User owner = User.builder().id(2L).role(Role.STUDENT).build();
        Resource resource = Resource.builder().id(1L).user(owner).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        resourceService.deleteResource(1L, moderator);

        verify(resourceRepository).delete(resource);
    }

    @Test
    void deleteResourceAllowsOwner() {
        User owner = User.builder().id(1L).role(Role.STUDENT).build();
        Resource resource = Resource.builder().id(1L).user(owner).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        resourceService.deleteResource(1L, owner);

        verify(resourceRepository).delete(resource);
    }

    @Test
    void deleteResourceRejectsNonOwnerStudent() {
        User owner = User.builder().id(2L).role(Role.STUDENT).build();
        User student = User.builder().id(1L).role(Role.STUDENT).build();
        Resource resource = Resource.builder().id(1L).user(owner).build();
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(resource));

        assertThatThrownBy(() -> resourceService.deleteResource(1L, student))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("Only the owner or an admin/moderator");
    }

    @Test
    void incrementUpvoteCountIncreasesCount() {
        Resource resource = Resource.builder().id(1L).upvoteCount(3).build();
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> inv.getArgument(0));

        resourceService.incrementUpvoteCount(resource);

        assertThat(resource.getUpvoteCount()).isEqualTo(4);
    }

    @Test
    void decrementUpvoteCountDoesNotGoBelowZero() {
        Resource resource = Resource.builder().id(1L).upvoteCount(0).build();
        when(resourceRepository.save(any(Resource.class))).thenAnswer(inv -> inv.getArgument(0));

        resourceService.decrementUpvoteCount(resource);

        assertThat(resource.getUpvoteCount()).isZero();
    }
}
