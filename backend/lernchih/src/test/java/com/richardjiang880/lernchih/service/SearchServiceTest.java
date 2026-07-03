package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.SearchResult;
import com.richardjiang880.lernchih.model.Channel;
import com.richardjiang880.lernchih.model.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchServiceTest {

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private SearchService searchService;

    @SuppressWarnings("unchecked")
    private <T> TypedQuery<T> emptyQuery(Class<T> type) {
        TypedQuery<T> query = mock(TypedQuery.class);
        when(query.setParameter(eq("q"), anyString())).thenReturn(query);
        when(query.getResultList()).thenReturn(List.of());
        return query;
    }

    @Test
    void searchReturnsEmptyListForBlankQuery() {
        assertThat(searchService.search("   ")).isEmpty();
        assertThat(searchService.search(null)).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void searchReturnsMappedResults() {
        Resource resource = Resource.builder().id(1L).title("Java").description("Guide").slug("java").build();
        Channel channel = Channel.builder().id(2L).name("Java").description("Chat").slug("java-chat").build();

        TypedQuery<Resource> resourceQuery = mock(TypedQuery.class);
        TypedQuery<Channel> channelQuery = mock(TypedQuery.class);
        when(resourceQuery.setParameter(eq("q"), anyString())).thenReturn(resourceQuery);
        when(resourceQuery.getResultList()).thenReturn(List.of(resource));
        when(channelQuery.setParameter(eq("q"), anyString())).thenReturn(channelQuery);
        when(channelQuery.getResultList()).thenReturn(List.of(channel));

        when(entityManager.createQuery(anyString(), eq(Resource.class))).thenReturn(resourceQuery);
        when(entityManager.createQuery(anyString(), eq(Channel.class))).thenReturn(channelQuery);

        List<SearchResult> results = searchService.search("java");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).type()).isEqualTo("resource");
        assertThat(results.get(1).type()).isEqualTo("channel");
    }
}
