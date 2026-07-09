package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ModuleCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleCompletionRepository extends JpaRepository<ModuleCompletion, Long> {

    List<ModuleCompletion> findByUserIdAndModuleIdIn(Long userId, Collection<Long> moduleIds);

    Optional<ModuleCompletion> findByUserIdAndModuleId(Long userId, Long moduleId);

    void deleteByUserIdAndModuleId(Long userId, Long moduleId);
}
