package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.ConceptMapDtos.ConceptMapResponse;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.CreateNodeRequest;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.NodeResponse;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.SaveLayoutRequest;
import com.richardjiang880.lernchih.service.ConceptMapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the per-subject concept map (F6). Exposes endpoints
 * scoped to a subject for reading the map, adding nodes, persisting a
 * rearranged layout, and removing nodes.
 */
@RestController
@RequestMapping("/api/subjects/{subjectId}/concept-map")
public class ConceptMapController {

    private final ConceptMapService conceptMapService;

    public ConceptMapController(ConceptMapService conceptMapService) {
        this.conceptMapService = conceptMapService;
    }

    @GetMapping
    public ResponseEntity<ConceptMapResponse> getMap(@PathVariable Long subjectId) {
        return ResponseEntity.ok(conceptMapService.getMap(subjectId));
    }

    @PostMapping("/nodes")
    public ResponseEntity<NodeResponse> addNode(
            @PathVariable Long subjectId,
            @RequestBody CreateNodeRequest request) {
        return ResponseEntity.ok(conceptMapService.addNode(subjectId, request));
    }

    @PutMapping("/layout")
    public ResponseEntity<Void> saveLayout(
            @PathVariable Long subjectId,
            @RequestBody SaveLayoutRequest request) {
        conceptMapService.saveLayout(subjectId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/nodes/{nodeId}")
    public ResponseEntity<Void> deleteNode(
            @PathVariable Long subjectId,
            @PathVariable Long nodeId) {
        conceptMapService.deleteNode(subjectId, nodeId);
        return ResponseEntity.noContent().build();
    }
}
