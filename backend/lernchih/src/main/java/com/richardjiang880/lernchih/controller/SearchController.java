package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.SearchResult;
import com.richardjiang880.lernchih.service.SearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<List<SearchResult>> search(@RequestParam String q) {
        return ResponseEntity.ok(searchService.search(q));
    }
}
