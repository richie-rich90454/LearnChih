package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUserId(Long userId);

    List<UserBadge> findByUserIdAndFeaturedTrue(Long userId);
}
