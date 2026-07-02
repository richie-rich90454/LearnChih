package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.*;
import com.richardjiang880.lernchih.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
/**
 * Service for resource CRUD, file uploads, and upvote management.
 */
public class ResourceService {

    private static final Logger log = LoggerFactory.getLogger(ResourceService.class);

    private final ResourceRepository resourceRepository;
    private final ResourceThreadRepository resourceThreadRepository;
    private final ResourcePostRepository resourcePostRepository;
    private final UpvoteRepository upvoteRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository topicRepository;
    private final CourseRepository courseRepository;
    private final FileValidator fileValidator;
    private final ContentSanitizer contentSanitizer;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public ResourceService(ResourceRepository resourceRepository,
                           ResourceThreadRepository resourceThreadRepository,
                           ResourcePostRepository resourcePostRepository,
                           UpvoteRepository upvoteRepository,
                           SubjectRepository subjectRepository,
                           TopicRepository topicRepository,
                           CourseRepository courseRepository,
                           FileValidator fileValidator,
                           ContentSanitizer contentSanitizer) {
        this.resourceRepository = resourceRepository;
        this.resourceThreadRepository = resourceThreadRepository;
        this.resourcePostRepository = resourcePostRepository;
        this.upvoteRepository = upvoteRepository;
        this.subjectRepository = subjectRepository;
        this.topicRepository = topicRepository;
        this.courseRepository = courseRepository;
        this.fileValidator = fileValidator;
        this.contentSanitizer = contentSanitizer;
    }

    @Transactional
    public Resource createResource(CreateResourceRequest request, MultipartFile file, User user) {
        String filePath = null;

        if (request.getType() == ResourceType.UPLOAD) {
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File is required for UPLOAD type resources");
            }
            filePath = saveFile(file);
        } else if (request.getType() == ResourceType.LINK) {
            if (request.getExternalUrl() == null || request.getExternalUrl().isBlank()) {
                throw new IllegalArgumentException("External URL is required for LINK type resources");
            }
        }

        Subject subject = request.getSubjectId() != null
                ? subjectRepository.findById(request.getSubjectId()).orElse(null) : null;
        Topic topic = request.getTopicId() != null
                ? topicRepository.findById(request.getTopicId()).orElse(null) : null;
        Course course = request.getCourseId() != null
                ? courseRepository.findById(request.getCourseId()).orElse(null) : null;

        Resource resource = Resource.builder()
                // Sanitize user-supplied text: title is plain text, description
                // may contain a safe subset of HTML markup.
                .title(contentSanitizer.sanitizePlain(request.getTitle()))
                .description(contentSanitizer.sanitize(request.getDescription()))
                .category(request.getCategory())
                .type(request.getType())
                .filePath(filePath)
                .externalUrl(request.getExternalUrl())
                .user(user)
                .subject(subject)
                .topic(topic)
                .course(course)
                .upvoteCount(0)
                .build();

        resource = resourceRepository.save(resource);

        // Auto-create a discussion thread for each new resource
        ResourceThread thread = ResourceThread.builder()
                .resource(resource)
                .build();
        resourceThreadRepository.save(thread);

        // Award 10 credits for contributing a resource
        user.setCredits(user.getCredits() + 10);

        return resource;
    }

    @Transactional(readOnly = true)
    public Page<Resource> getResources(Pageable pageable, Long subjectId, ResourceCategory category) {
        if (subjectId != null || category != null) {
            return resourceRepository.findWithFilters(subjectId, category, pageable);
        }
        return resourceRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public ResourceDetailResponse getResourceDetail(Long resourceId, Long currentUserId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        ResourceThread thread = resourceThreadRepository.findByResourceId(resourceId)
                .orElseThrow(() -> new IllegalStateException("Thread missing for resource " + resourceId));

        boolean upvotedByMe = currentUserId != null
                && upvoteRepository.existsByUserIdAndResourceId(currentUserId, resourceId);

        List<PostResponse> posts = resourcePostRepository
                .findByThreadIdOrderByCreatedAtAsc(thread.getId(), Pageable.unpaged())
                .stream()
                .map(p -> new PostResponse(
                        p.getId(),
                        p.getThread().getId(),
                        p.getUser().getId(),
                        p.getUser().getName(),
                        p.getContent(),
                        p.getCreatedAt()
                ))
                .toList();

        return new ResourceDetailResponse(
                resource.getId(),
                resource.getTitle(),
                resource.getDescription(),
                resource.getCategory().name(),
                resource.getType().name(),
                resource.getFilePath(),
                resource.getExternalUrl(),
                resource.getUser().getId(),
                resource.getUser().getName(),
                resource.getSubject() != null ? resource.getSubject().getId() : null,
                resource.getSubject() != null ? resource.getSubject().getName() : null,
                resource.getUpvoteCount(),
                upvotedByMe,
                resource.getCreatedAt(),
                thread.getId(),
                posts
        );
    }

    @Transactional
    public void deleteResource(Long resourceId, User currentUser) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        // Only admins and moderators can delete resources
        if (!isAdminOrModerator(currentUser)) {
            throw new IllegalArgumentException("Only admins and moderators can delete resources");
        }

        resourceRepository.delete(resource);
    }

    public void incrementUpvoteCount(Resource resource) {
        resource.setUpvoteCount(resource.getUpvoteCount() + 1);
        resourceRepository.save(resource);
    }

    public void decrementUpvoteCount(Resource resource) {
        // Ensure upvote count never goes below zero
        int newCount = Math.max(0, resource.getUpvoteCount() - 1);
        resource.setUpvoteCount(newCount);
        resourceRepository.save(resource);
    }

    private boolean isAdminOrModerator(User user) {
        return user.getRole() == Role.ADMIN || user.getRole() == Role.MODERATOR;
    }

    private String saveFile(MultipartFile file) {
        // Validate extension allowlist, declared MIME, and magic bytes.
        // Returns the validated lowercase extension (without the dot).
        String extension = fileValidator.validate(file);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            // Create upload directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Build a safe UUID-based filename, preserving the validated
            // extension. The client-provided filename is never trusted.
            String uniqueFilename = UUID.randomUUID() + "." + extension;
            Path targetLocation = uploadPath.resolve(uniqueFilename).normalize();

            // Containment check: ensure the resolved target stays within the
            // upload directory (defense against path traversal).
            if (!targetLocation.startsWith(uploadPath)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            Files.copy(file.getInputStream(), targetLocation);

            log.info("Saved uploaded file: {}", uniqueFilename);
            return uniqueFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save uploaded file", e);
        }
    }
}
