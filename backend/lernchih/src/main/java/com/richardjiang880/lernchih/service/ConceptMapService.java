package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.ConceptMapDtos.ConceptMapResponse;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.CreateNodeRequest;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.EdgeResponse;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.NodePosition;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.NodeResponse;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.SaveLayoutRequest;
import com.richardjiang880.lernchih.dto.ConceptMapDtos.SubjectOption;
import com.richardjiang880.lernchih.model.ConceptMapEdge;
import com.richardjiang880.lernchih.model.ConceptMapNode;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.repository.ConceptMapEdgeRepository;
import com.richardjiang880.lernchih.repository.ConceptMapNodeRepository;
import com.richardjiang880.lernchih.repository.SubjectRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service for the per-subject concept map (F6). Supports reading the full map
 * (nodes + edges), adding a node with an optional edge to a parent, persisting
 * a rearranged layout in bulk, and removing a node (edges cascade-delete at the
 * DB level).
 */
@Service
public class ConceptMapService {

    private final ConceptMapNodeRepository nodeRepository;
    private final ConceptMapEdgeRepository edgeRepository;
    private final SubjectRepository subjectRepository;

    public ConceptMapService(ConceptMapNodeRepository nodeRepository,
                             ConceptMapEdgeRepository edgeRepository,
                             SubjectRepository subjectRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public ConceptMapResponse getMap(Long subjectId) {
        List<NodeResponse> nodes = nodeRepository.findBySubjectId(subjectId)
                .stream()
                .map(this::toNodeResponse)
                .toList();
        List<EdgeResponse> edges = edgeRepository.findBySubjectId(subjectId)
                .stream()
                .map(this::toEdgeResponse)
                .toList();
        return new ConceptMapResponse(nodes, edges);
    }

    @Transactional
    public NodeResponse addNode(Long subjectId, CreateNodeRequest request) {
        if (request == null || request.label() == null || request.label().isBlank()) {
            throw new IllegalArgumentException("Node label is required");
        }
        ConceptMapNode node = ConceptMapNode.builder()
                .subjectId(subjectId)
                .label(request.label().trim())
                .posX(request.posX() != null ? request.posX() : 0.0)
                .posY(request.posY() != null ? request.posY() : 0.0)
                .build();
        node = nodeRepository.save(node);

        if (request.parentId() != null) {
            ConceptMapNode parent = nodeRepository.findById(request.parentId())
                    .filter(p -> p.getSubjectId().equals(subjectId))
                    .orElseThrow(() -> new IllegalArgumentException("Parent node not found in this subject"));
            ConceptMapEdge edge = ConceptMapEdge.builder()
                    .subjectId(subjectId)
                    .sourceId(parent.getId())
                    .targetId(node.getId())
                    .build();
            edgeRepository.save(edge);
        }

        return toNodeResponse(node);
    }

    @Transactional
    public void saveLayout(Long subjectId, SaveLayoutRequest request) {
        if (request == null || request.nodes() == null || request.nodes().isEmpty()) {
            return;
        }
        List<ConceptMapNode> existing = nodeRepository.findBySubjectId(subjectId);
        Map<Long, ConceptMapNode> byId = existing.stream()
                .collect(Collectors.toMap(ConceptMapNode::getId, Function.identity()));
        for (NodePosition pos : request.nodes()) {
            ConceptMapNode node = byId.get(pos.id());
            if (node != null) {
                node.setPosX(pos.posX());
                node.setPosY(pos.posY());
            }
        }
        nodeRepository.saveAll(existing);
    }

    @Transactional
    public void deleteNode(Long subjectId, Long nodeId) {
        nodeRepository.findById(nodeId)
                .filter(n -> n.getSubjectId().equals(subjectId))
                .ifPresent(nodeRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<SubjectOption> listSubjects() {
        return subjectRepository.findAll().stream()
                .map(this::toSubjectOption)
                .toList();
    }

    private NodeResponse toNodeResponse(ConceptMapNode node) {
        return new NodeResponse(node.getId(), node.getLabel(), node.getPosX(), node.getPosY());
    }

    private EdgeResponse toEdgeResponse(ConceptMapEdge edge) {
        return new EdgeResponse(edge.getId(), edge.getSourceId(), edge.getTargetId());
    }

    private SubjectOption toSubjectOption(Subject subject) {
        return new SubjectOption(subject.getId(), subject.getName());
    }
}
