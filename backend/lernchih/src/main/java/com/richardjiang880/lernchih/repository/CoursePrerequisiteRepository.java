package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.CoursePrerequisite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Repository for {@link CoursePrerequisite} edges (F19). Supports listing a
 * course's direct prerequisites, finding edges by the prerequisite course
 * (for cycle detection), and removing a specific edge.
 */
public interface CoursePrerequisiteRepository extends JpaRepository<CoursePrerequisite, Long> {

    List<CoursePrerequisite> findByCourseId(Long courseId);

    List<CoursePrerequisite> findByPrerequisiteCourseId(Long prerequisiteCourseId);

    long deleteByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);

    boolean existsByCourseIdAndPrerequisiteCourseId(Long courseId, Long prerequisiteCourseId);
}
