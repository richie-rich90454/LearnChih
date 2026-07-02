package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.SearchResult;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class SearchService {

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<SearchResult> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        String like = "%" + query.trim().toLowerCase() + "%";

        List<SearchResult> results = new ArrayList<>();
        results.addAll(searchResources(like));
        results.addAll(searchChannels(like));
        return results;
    }

    private List<SearchResult> searchResources(String like) {
        TypedQuery<Resource> query = entityManager.createQuery(
                "SELECT r FROM Resource r WHERE LOWER(r.title) LIKE :q OR LOWER(r.description) LIKE :q",
                Resource.class
        );
        query.setParameter("q", like);
        return query.getResultList().stream()
                .map(r -> new SearchResult(
                        "resource",
                        r.getId(),
                        r.getTitle(),
                        r.getDescription(),
                        r.getSlug(),
                        r.getCreatedAt()
                ))
                .toList();
    }

    private List<SearchResult> searchChannels(String like) {
        TypedQuery<Channel> query = entityManager.createQuery(
                "SELECT c FROM Channel c WHERE LOWER(c.name) LIKE :q OR LOWER(c.description) LIKE :q",
                Channel.class
        );
        query.setParameter("q", like);
        return query.getResultList().stream()
                .map(c -> new SearchResult(
                        "channel",
                        c.getId(),
                        c.getName(),
                        c.getDescription(),
                        c.getSlug(),
                        c.getCreatedAt()
                ))
                .toList();
    }
}
