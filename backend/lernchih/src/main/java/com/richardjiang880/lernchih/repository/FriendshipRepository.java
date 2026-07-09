package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.Friendship;
import com.richardjiang880.lernchih.model.enums.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    /**
     * Find any friendship record between two users, regardless of who
     * initiated it.
     */
    @Query("SELECT f FROM Friendship f WHERE " +
           "(f.requesterId = :u1 AND f.addresseeId = :u2) OR " +
           "(f.requesterId = :u2 AND f.addresseeId = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") Long u1, @Param("u2") Long u2);

    /** All accepted friendships involving the given user (either side). */
    @Query("SELECT f FROM Friendship f WHERE f.status = 'ACCEPTED' AND " +
           "(f.requesterId = :userId OR f.addresseeId = :userId)")
    List<Friendship> findAcceptedByUserId(@Param("userId") Long userId);

    /** Pending requests received by the user (they are the addressee). */
    List<Friendship> findByAddresseeIdAndStatus(Long addresseeId, FriendshipStatus status);

    /** Pending requests sent by the user (they are the requester). */
    List<Friendship> findByRequesterIdAndStatus(Long requesterId, FriendshipStatus status);
}
