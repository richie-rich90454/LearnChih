package com.richardjiang880.lernchih.repository;

import com.richardjiang880.lernchih.model.PlaylistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistItemRepository extends JpaRepository<PlaylistItem, Long> {

    List<PlaylistItem> findByPlaylistIdOrderBySortOrderAsc(Long playlistId);

    Optional<PlaylistItem> findByPlaylistIdAndResourceId(Long playlistId, Long resourceId);
}
