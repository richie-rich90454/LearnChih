package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ReviewSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewScheduleRepository extends JpaRepository<ReviewSchedule, Long> {

    List<ReviewSchedule> findByUserIdAndDueDateLessThanEqualOrderByDueDateAsc(Long userId, LocalDate dueDate);

    List<ReviewSchedule> findByUserIdOrderByDueDateAsc(Long userId);

    Optional<ReviewSchedule> findByUserIdAndResourceId(Long userId, Long resourceId);
}
