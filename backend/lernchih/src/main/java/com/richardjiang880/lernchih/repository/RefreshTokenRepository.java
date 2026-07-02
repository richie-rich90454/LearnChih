package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.RefreshToken;
import com.richardjiang880.lernchih.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByFamilyIdAndRevokedFalse(Long familyId);

    List<RefreshToken> findByUser(User user);

    void deleteByUser(User user);
}
