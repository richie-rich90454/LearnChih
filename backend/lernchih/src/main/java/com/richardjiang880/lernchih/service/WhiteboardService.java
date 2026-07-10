package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.WhiteboardDtos;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.Whiteboard;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.repository.WhiteboardRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Shared whiteboard lifecycle (F42): create, fetch, update strokes, delete.
 * Stored content is a JSON string of strokes produced by the SVG frontend.
 */
@Service
public class WhiteboardService {

    private final WhiteboardRepository whiteboardRepository;
    private final UserRepository userRepository;

    public WhiteboardService(WhiteboardRepository whiteboardRepository,
                             UserRepository userRepository) {
        this.whiteboardRepository = whiteboardRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<WhiteboardDtos.WhiteboardResponse> listByGroup(Long groupId) {
        List<Whiteboard> boards = whiteboardRepository.findByGroupIdOrderByUpdatedAtDesc(groupId);
        if (boards.isEmpty()) {
            return List.of();
        }
        List<Long> creatorIds = boards.stream().map(Whiteboard::getCreatedBy).distinct().toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(creatorIds).forEach(u -> nameById.put(u.getId(), u.getName()));
        return boards.stream().map(b -> toResponse(b, nameById)).toList();
    }

    @Transactional(readOnly = true)
    public WhiteboardDtos.WhiteboardResponse get(Long id) {
        Whiteboard board = whiteboardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Whiteboard not found"));
        return toResponse(board, resolveNames(List.of(board)));
    }

    @Transactional
    public WhiteboardDtos.WhiteboardResponse create(Long groupId,
                                                     WhiteboardDtos.CreateWhiteboardRequest request,
                                                     User creator) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Whiteboard title is required");
        }
        Whiteboard board = Whiteboard.builder()
                .groupId(groupId)
                .title(request.title())
                .content("[]")
                .createdBy(creator.getId())
                .build();
        board = whiteboardRepository.save(board);
        return toResponse(board, resolveNames(List.of(board)));
    }

    @Transactional
    public WhiteboardDtos.WhiteboardResponse update(Long id,
                                                     WhiteboardDtos.UpdateWhiteboardRequest request,
                                                     User user) {
        Whiteboard board = whiteboardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Whiteboard not found"));
        if (request.title() != null && !request.title().isBlank()) {
            board.setTitle(request.title());
        }
        if (request.content() != null) {
            board.setContent(request.content());
        }
        board = whiteboardRepository.save(board);
        return toResponse(board, resolveNames(List.of(board)));
    }

    @Transactional
    public void delete(Long id, User user) {
        Whiteboard board = whiteboardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Whiteboard not found"));
        if (!board.getCreatedBy().equals(user.getId())) {
            throw new IllegalStateException("Only the whiteboard creator can delete it");
        }
        whiteboardRepository.delete(board);
    }

    private Map<Long, String> resolveNames(List<Whiteboard> boards) {
        List<Long> creatorIds = boards.stream().map(Whiteboard::getCreatedBy).distinct().toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(creatorIds).forEach(u -> nameById.put(u.getId(), u.getName()));
        return nameById;
    }

    private WhiteboardDtos.WhiteboardResponse toResponse(Whiteboard board, Map<Long, String> nameById) {
        return new WhiteboardDtos.WhiteboardResponse(
                board.getId(),
                board.getGroupId(),
                board.getTitle(),
                board.getContent(),
                board.getCreatedBy(),
                nameById.getOrDefault(board.getCreatedBy(), "Unknown"),
                board.getCreatedAt(),
                board.getUpdatedAt());
    }
}
