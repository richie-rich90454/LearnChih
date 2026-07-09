package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdOrderBySortOrderAsc(Long courseId);
}
