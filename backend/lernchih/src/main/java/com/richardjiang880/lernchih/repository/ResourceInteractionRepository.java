package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.ResourceInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceInteractionRepository extends JpaRepository<ResourceInteraction, Long> {

    List<ResourceInteraction> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByUserIdAndResourceIdAndInteraction(
            Long userId, Long resourceId, ResourceInteraction.Interaction interaction);
}
