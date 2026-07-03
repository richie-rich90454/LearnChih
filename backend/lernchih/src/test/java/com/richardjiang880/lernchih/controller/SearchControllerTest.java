package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.SearchResult;
import com.richardjiang880.lernchih.service.SearchService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchControllerTest {

    @Mock
    private SearchService searchService;

    private SearchController controller;

    @BeforeEach
    void setUp() {
        controller = new SearchController(searchService);
    }

    @Test
    void searchReturnsResults() {
        SearchResult result = new SearchResult("RESOURCE", 1L, "Intro", "desc", "intro", LocalDateTime.now());
        when(searchService.search("java")).thenReturn(List.of(result));

        ResponseEntity<List<SearchResult>> response = controller.search("java");

        assertThat(response.getBody()).containsExactly(result);
    }
}
