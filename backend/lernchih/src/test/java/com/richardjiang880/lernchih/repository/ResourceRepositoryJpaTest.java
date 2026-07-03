package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.AbstractRepositoryTest;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.model.ResourceCategory;
import com.richardjiang880.lernchih.model.ResourceType;
import com.richardjiang880.lernchih.model.Role;
import com.richardjiang880.lernchih.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceRepositoryJpaTest extends AbstractRepositoryTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void findBySlugReturnsResourceWhenExists() {
        User user = persistUser("owner@example.com");
        persistResource("intro-to-java", "Intro to Java", ResourceCategory.ARTICLE, user);

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
        persistResource("existing-slug", "Existing", ResourceCategory.OTHER, user);

        assertThat(resourceRepository.existsBySlug("existing-slug")).isTrue();
    }

    @Test
    void existsBySlugReturnsFalseForUnknownSlug() {
        assertThat(resourceRepository.existsBySlug("unknown")).isFalse();
    }

    @Test
    void findTop20ByOrderByCreatedAtDescReturnsRecentlyCreatedFirst() {
        User user = persistUser("top-user@example.com");
        Resource first = persistResource("first-resource", "First", ResourceCategory.ARTICLE, user);
        Resource second = persistResource("second-resource", "Second", ResourceCategory.GUIDE, user);

        List<Resource> resources = resourceRepository.findTop20ByOrderByCreatedAtDesc();

        assertThat(resources).hasSize(2);
        assertThat(resources.get(0).getId()).isEqualTo(second.getId());
    }

    @Test
    void findWithFiltersFiltersByCategory() {
        User user = persistUser("filter-user@example.com");
        persistResource("article-resource", "Article", ResourceCategory.ARTICLE, user);
        persistResource("video-resource", "Video", ResourceCategory.VIDEO, user);

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
        return entityManager.persistAndFlush(user);
    }

    private Resource persistResource(String slug, String title, ResourceCategory category, User user) {
        Resource resource = Resource.builder()
                .slug(slug)
                .title(title)
                .description(title + " resource")
                .category(category)
                .type(ResourceType.LINK)
                .user(user)
                .upvoteCount(0)
                .build();
        return entityManager.persistAndFlush(resource);
    }
}
