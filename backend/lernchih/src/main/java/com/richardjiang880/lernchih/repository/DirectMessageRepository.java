package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.DirectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DirectMessageRepository extends JpaRepository<DirectMessage, Long> {

    /**
     * All messages exchanged between the two users, oldest first.
     */
    @Query("SELECT m FROM DirectMessage m " +
           "WHERE (m.fromUserId = :a AND m.toUserId = :b) " +
           "   OR (m.fromUserId = :b AND m.toUserId = :a) " +
           "ORDER BY m.sentAt ASC")
    List<DirectMessage> findConversation(@Param("a") Long userA, @Param("b") Long userB);

    /**
     * Every conversation partner the given user has exchanged messages with,
     * alongside the most recent message timestamp for sidebar ordering.
     */
    @Query("SELECT DISTINCT CASE WHEN m.fromUserId = :userId THEN m.toUserId ELSE m.fromUserId END " +
           "FROM DirectMessage m " +
           "WHERE m.fromUserId = :userId OR m.toUserId = :userId")
    List<Long> findConversationPartnerIds(@Param("userId") Long userId);

    /**
     * Messages sent to {@code userId} that have not yet been read, used to
     * mark a conversation as read when the user opens it.
     */
    List<DirectMessage> findByToUserIdAndReadAtIsNull(Long toUserId);
}
