package com.richardjiang880.lernchih.dto;

import java.util.List;

/**
 * Request/response DTOs for the per-subject concept map (F6). A concept map is
 * a directed graph of labeled nodes (with x/y positions on an SVG canvas)
 * connected by edges. Nodes can be added individually, rearranged in bulk, and
 * removed; edges are derived implicitly from a parent reference when a node is
 * created.
 */
public final class ConceptMapDtos {

    private ConceptMapDtos() {
    }

    public record NodeResponse(Long id, String label, double posX, double posY) {
    }

    public record EdgeResponse(Long id, Long sourceId, Long targetId) {
    }

    public record ConceptMapResponse(List<NodeResponse> nodes, List<EdgeResponse> edges) {
    }

    public record CreateNodeRequest(String label, Double posX, Double posY, Long parentId) {
    }

    public record NodePosition(Long id, double posX, double posY) {
    }

    public record SaveLayoutRequest(List<NodePosition> nodes) {
    }

    public record SubjectOption(Long id, String name) {
    }
}
