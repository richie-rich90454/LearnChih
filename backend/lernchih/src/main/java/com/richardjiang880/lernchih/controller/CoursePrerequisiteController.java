package com.richardjiang880.lernchih.controller;

import com.richardjiang880.lernchih.dto.CoursePrerequisiteDtos.CreatePrerequisiteRequest;
import com.richardjiang880.lernchih.dto.CoursePrerequisiteDtos.PrerequisiteGap;
import com.richardjiang880.lernchih.dto.CoursePrerequisiteDtos.PrerequisiteResponse;
import com.richardjiang880.lernchih.dto.CoursePrerequisiteDtos.PrerequisiteStatusResponse;
import com.richardjiang880.lernchih.model.Course;
import com.richardjiang880.lernchih.model.CourseModule;
import com.richardjiang880.lernchih.model.CoursePrerequisite;
import com.richardjiang880.lernchih.model.ModuleCompletion;
import com.richardjiang880.lernchih.repository.CourseModuleRepository;
import com.richardjiang880.lernchih.repository.CoursePrerequisiteRepository;
import com.richardjiang880.lernchih.repository.CourseRepository;
import com.richardjiang880.lernchih.repository.ModuleCompletionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST controller for the course prerequisite graph (F19).
 *
 * <p>Endpoints (nested under /api/courses/{courseId}/prerequisites):
 * <ul>
 *   <li>GET    /                 — list prerequisite edges</li>
 *   <li>POST   /                 — add a prerequisite edge (with cycle detection)</li>
 *   <li>DELETE /{prereqCourseId} — remove a prerequisite edge</li>
 *   <li>GET    /status?userId=X  — check whether a user has met all prerequisites</li>
 * </ul>
 *
 * <p>A course is satisfied for a user when every prerequisite course has all
 * of its modules completed by that user.
 */
@RestController
@RequestMapping("/api/courses/{courseId}/prerequisites")
public class CoursePrerequisiteController {

    private final CoursePrerequisiteRepository prereqRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final ModuleCompletionRepository moduleCompletionRepository;

    public CoursePrerequisiteController(CoursePrerequisiteRepository prereqRepository,
                                         CourseRepository courseRepository,
                                         CourseModuleRepository courseModuleRepository,
                                         ModuleCompletionRepository moduleCompletionRepository) {
        this.prereqRepository = prereqRepository;
        this.courseRepository = courseRepository;
        this.courseModuleRepository = courseModuleRepository;
        this.moduleCompletionRepository = moduleCompletionRepository;
    }

    @GetMapping
    public ResponseEntity<List<PrerequisiteResponse>> list(@PathVariable Long courseId) {
        List<CoursePrerequisite> edges = prereqRepository.findByCourseId(courseId);
        if (edges.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        Map<Long, String> nameById = resolveCourseNames(edges.stream().map(CoursePrerequisite::getPrerequisiteCourseId).toList());
        return ResponseEntity.ok(edges.stream().map(e -> toResponse(e, nameById)).toList());
    }

    @PostMapping
    public ResponseEntity<PrerequisiteResponse> add(
            @PathVariable Long courseId,
            @RequestBody CreatePrerequisiteRequest request) {
        Long prereqId = request.prerequisiteCourseId();
        if (prereqId == null) {
            throw new IllegalArgumentException("prerequisiteCourseId is required");
        }
        if (prereqId.equals(courseId)) {
            throw new IllegalArgumentException("A course cannot be its own prerequisite");
        }
        if (prereqRepository.existsByCourseIdAndPrerequisiteCourseId(courseId, prereqId)) {
            throw new IllegalStateException("Prerequisite edge already exists");
        }
        // Cycle detection: if prereqId can already reach courseId, adding this edge creates a cycle
        if (createsCycle(courseId, prereqId)) {
            throw new IllegalStateException("Adding this prerequisite would create a cycle in the prerequisite graph");
        }
        CoursePrerequisite edge = CoursePrerequisite.builder()
                .courseId(courseId)
                .prerequisiteCourseId(prereqId)
                .build();
        edge = prereqRepository.save(edge);
        Map<Long, String> nameById = resolveCourseNames(List.of(prereqId));
        return ResponseEntity.ok(toResponse(edge, nameById));
    }

    @DeleteMapping("/{prerequisiteCourseId}")
    public ResponseEntity<Void> remove(
            @PathVariable Long courseId,
            @PathVariable Long prerequisiteCourseId) {
        prereqRepository.deleteByCourseIdAndPrerequisiteCourseId(courseId, prerequisiteCourseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/status")
    public ResponseEntity<PrerequisiteStatusResponse> status(
            @PathVariable Long courseId,
            @RequestParam Long userId) {
        List<CoursePrerequisite> edges = prereqRepository.findByCourseId(courseId);
        if (edges.isEmpty()) {
            return ResponseEntity.ok(new PrerequisiteStatusResponse(courseId, true, List.of()));
        }
        List<PrerequisiteGap> gaps = new ArrayList<>();
        boolean allSatisfied = true;
        for (CoursePrerequisite edge : edges) {
            Long prereqId = edge.getPrerequisiteCourseId();
            String prereqName = courseRepository.findById(prereqId).map(Course::getName).orElse("Unknown");
            boolean completed = isCourseCompleted(userId, prereqId);
            if (!completed) allSatisfied = false;
            gaps.add(new PrerequisiteGap(prereqId, prereqName, completed));
        }
        return ResponseEntity.ok(new PrerequisiteStatusResponse(courseId, allSatisfied, gaps));
    }

    /**
     * DFS from {@code prereqId} following prerequisite edges; if we reach
     * {@code courseId}, adding the edge courseId→prereqId would create a cycle.
     */
    private boolean createsCycle(Long courseId, Long prereqId) {
        Set<Long> visited = new HashSet<>();
        Deque<Long> stack = new ArrayDeque<>();
        stack.push(prereqId);
        while (!stack.isEmpty()) {
            Long current = stack.pop();
            if (current.equals(courseId)) return true;
            if (!visited.add(current)) continue;
            for (CoursePrerequisite next : prereqRepository.findByCourseId(current)) {
                stack.push(next.getPrerequisiteCourseId());
            }
        }
        return false;
    }

    /**
     * A course is "completed" by a user when all of its modules have
     * ModuleCompletion records for that user.
     */
    private boolean isCourseCompleted(Long userId, Long courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderBySortOrderAsc(courseId);
        if (modules.isEmpty()) return true; // no modules = vacuously satisfied
        List<Long> moduleIds = modules.stream().map(CourseModule::getId).toList();
        Set<Long> completedModuleIds = moduleCompletionRepository
                .findByUserIdAndModuleIdIn(userId, moduleIds)
                .stream()
                .map(ModuleCompletion::getModuleId)
                .collect(java.util.stream.Collectors.toSet());
        return completedModuleIds.containsAll(moduleIds);
    }

    private Map<Long, String> resolveCourseNames(List<Long> courseIds) {
        Map<Long, String> nameById = new HashMap<>();
        courseRepository.findAllById(courseIds).forEach(c -> nameById.put(c.getId(), c.getName()));
        return nameById;
    }

    private PrerequisiteResponse toResponse(CoursePrerequisite edge, Map<Long, String> nameById) {
        return new PrerequisiteResponse(
                edge.getId(),
                edge.getCourseId(),
                edge.getPrerequisiteCourseId(),
                nameById.getOrDefault(edge.getPrerequisiteCourseId(), "Unknown"),
                edge.getCreatedAt());
    }
}
