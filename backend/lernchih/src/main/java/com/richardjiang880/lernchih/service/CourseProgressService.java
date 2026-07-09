package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.CourseProgressDtos.CompleteModuleRequest;
import com.richardjiang880.lernchih.dto.CourseProgressDtos.CourseProgressResponse;
import com.richardjiang880.lernchih.dto.CourseProgressDtos.ModuleProgressItem;
import com.richardjiang880.lernchih.dto.CourseProgressDtos.ModuleResponse;
import com.richardjiang880.lernchih.model.Course;
import com.richardjiang880.lernchih.model.CourseModule;
import com.richardjiang880.lernchih.model.ModuleCompletion;
import com.richardjiang880.lernchih.repository.CourseModuleRepository;
import com.richardjiang880.lernchih.repository.CourseRepository;
import com.richardjiang880.lernchih.repository.ModuleCompletionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Tracks per-user completion of course modules (F3). Modules are defined on
 * the {@link CourseModule} entity; a {@link ModuleCompletion} row records that
 * a user has finished a module, optionally with a score.
 */
@Service
public class CourseProgressService {

    private final CourseModuleRepository courseModuleRepository;
    private final ModuleCompletionRepository moduleCompletionRepository;
    private final CourseRepository courseRepository;

    public CourseProgressService(CourseModuleRepository courseModuleRepository,
                                 ModuleCompletionRepository moduleCompletionRepository,
                                 CourseRepository courseRepository) {
        this.courseModuleRepository = courseModuleRepository;
        this.moduleCompletionRepository = moduleCompletionRepository;
        this.courseRepository = courseRepository;
    }

    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(Long userId, Long courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderBySortOrderAsc(courseId);
        String courseName = courseRepository.findById(courseId)
                .map(Course::getName)
                .orElse(null);

        List<Long> moduleIds = modules.stream().map(CourseModule::getId).toList();
        Map<Long, ModuleCompletion> completions = moduleCompletionRepository
                .findByUserIdAndModuleIdIn(userId, moduleIds)
                .stream()
                .collect(Collectors.toMap(ModuleCompletion::getModuleId, Function.identity()));

        List<ModuleProgressItem> items = modules.stream()
                .map(m -> {
                    ModuleCompletion c = completions.get(m.getId());
                    return new ModuleProgressItem(
                            toModuleResponse(m),
                            c != null,
                            c != null ? c.getCompletedAt() : null,
                            c != null ? c.getScore() : null
                    );
                })
                .toList();

        int completedCount = (int) items.stream().filter(ModuleProgressItem::completed).count();
        return new CourseProgressResponse(courseId, courseName, completedCount, items.size(), items);
    }

    @Transactional
    public ModuleProgressItem markComplete(Long userId, Long courseId, Long moduleId, CompleteModuleRequest request) {
        CourseModule module = courseModuleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        if (!module.getCourseId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to this course");
        }

        Integer score = request == null ? null : request.score();
        ModuleCompletion completion = moduleCompletionRepository
                .findByUserIdAndModuleId(userId, moduleId)
                .orElseGet(() -> ModuleCompletion.builder()
                        .userId(userId)
                        .moduleId(moduleId)
                        .build());
        completion.setScore(score);
        completion = moduleCompletionRepository.save(completion);

        return new ModuleProgressItem(toModuleResponse(module), true, completion.getCompletedAt(), completion.getScore());
    }

    @Transactional
    public void markIncomplete(Long userId, Long moduleId) {
        moduleCompletionRepository.deleteByUserIdAndModuleId(userId, moduleId);
    }

    private ModuleResponse toModuleResponse(CourseModule m) {
        return new ModuleResponse(m.getId(), m.getCourseId(), m.getTitle(), m.getSortOrder(), m.getDurationMinutes());
    }
}
