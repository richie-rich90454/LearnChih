package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Cohort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CohortRepository extends JpaRepository<Cohort, Long> {

    List<Cohort> findAllByOrderByCreatedAtDesc();
}
