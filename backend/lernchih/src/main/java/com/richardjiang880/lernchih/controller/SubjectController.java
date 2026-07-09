package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ConceptMapDtos.SubjectOption;
import com.richardjiang880.lernchih.service.ConceptMapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller that exposes a minimal subjects list (id + name) for the
 * concept-map page dropdown (F6). No existing endpoint provides a flat list
 * of subjects with both id and name.
 */
@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final ConceptMapService conceptMapService;

    public SubjectController(ConceptMapService conceptMapService) {
        this.conceptMapService = conceptMapService;
    }

    @GetMapping
    public ResponseEntity<List<SubjectOption>> listSubjects() {
        return ResponseEntity.ok(conceptMapService.listSubjects());
    }
}
