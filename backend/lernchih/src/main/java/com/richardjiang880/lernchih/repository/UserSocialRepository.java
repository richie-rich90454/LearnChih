package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.UserSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSocialRepository extends JpaRepository<UserSocial, Long> {

    List<UserSocial> findByUserId(Long userId);
}
