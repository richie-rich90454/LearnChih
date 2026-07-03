package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.AbstractIntegrationTest;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ResourceCategory;
import com.richardjiang880.lernchih.model.ResourceType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @BeforeEach
    void cleanUp() {
        resourceRepository.deleteAll();
        subjectRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void findBySlugReturnsResourceWhenExists() {
        User user = persistUser("resource-owner@example.com");
        Resource resource = Resource.builder()
                .slug("intro-to-java")
                .title("Intro to Java")
                .description("A beginner guide")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        resourceRepository.save(resource);

        assertThat(resourceRepository.findBySlug("intro-to-java"))
                .isPresent()
                .hasValueSatisfying(r -> assertThat(r.getTitle()).isEqualTo("Intro to Java"));
    }

    @Test
    void findBySlugReturnsEmptyWhenNotExists() {
        assertThat(resourceRepository.findBySlug("missing")).isEmpty();
    }

    @Test
    void existsBySlugReturnsTrueForExistingSlug() {
        User user = persistUser("slug-user@example.com");
        Resource resource = Resource.builder()
                .slug("existing-slug")
                .title("Existing")
                .description("Desc")
                .category(ResourceCategory.OTHER)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        resourceRepository.save(resource);

        assertThat(resourceRepository.existsBySlug("existing-slug")).isTrue();
    }

    @Test
    void findTop20ByOrderByCreatedAtDescReturnsRecentlyCreatedFirst() {
        User user = persistUser("top-user@example.com");
        Resource first = Resource.builder()
                .slug("first-resource")
                .title("First")
                .description("First resource")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        Resource second = Resource.builder()
                .slug("second-resource")
                .title("Second")
                .description("Second resource")
                .category(ResourceCategory.GUIDE)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        resourceRepository.save(first);
        resourceRepository.save(second);

        List<Resource> resources = resourceRepository.findTop20ByOrderByCreatedAtDesc();

        assertThat(resources).hasSize(2);
        assertThat(resources.get(0).getTitle()).isEqualTo("Second");
    }

    @Test
    void findBySubjectIdReturnsOnlyResourcesForThatSubject() {
        User user = persistUser("subject-user@example.com");
        Subject math = Subject.builder().name("Mathematics").build();
        Subject physics = Subject.builder().name("Physics").build();
        subjectRepository.save(math);
        subjectRepository.save(physics);

        Resource mathResource = Resource.builder()
                .slug("math-resource")
                .title("Math")
                .description("Math resource")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .subject(math)
                .build();
        Resource physicsResource = Resource.builder()
                .slug("physics-resource")
                .title("Physics")
                .description("Physics resource")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .subject(physics)
                .build();
        resourceRepository.save(mathResource);
        resourceRepository.save(physicsResource);

        Page<Resource> result = resourceRepository.findBySubjectId(math.getId(), PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Math");
    }

    @Test
    void findWithFiltersFiltersByCategory() {
        User user = persistUser("filter-user@example.com");
        Resource article = Resource.builder()
                .slug("article-resource")
                .title("Article")
                .description("Article resource")
                .category(ResourceCategory.ARTICLE)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        Resource video = Resource.builder()
                .slug("video-resource")
                .title("Video")
                .description("Video resource")
                .category(ResourceCategory.VIDEO)
                .type(ResourceType.LINK)
                .user(user)
                .build();
        resourceRepository.save(article);
        resourceRepository.save(video);

        Page<Resource> result = resourceRepository.findWithFilters(
                null, ResourceCategory.ARTICLE, PageRequest.of(0, 10));

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getCategory()).isEqualTo(ResourceCategory.ARTICLE);
    }

    private User persistUser(String email) {
        User user = User.builder()
                .email(email)
                .password("password")
                .name("Test User")
                .role(Role.STUDENT)
                .build();
        return userRepository.save(user);
    }
}
