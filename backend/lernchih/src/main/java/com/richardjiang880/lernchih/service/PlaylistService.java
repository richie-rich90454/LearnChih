package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.PlaylistDtos.AddItemRequest;
import com.richardjiang880.lernchih.dto.PlaylistDtos.CreatePlaylistRequest;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistDetailResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistItemResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.PlaylistResponse;
import com.richardjiang880.lernchih.dto.PlaylistDtos.UpdatePlaylistRequest;
import com.richardjiang880.lernchih.model.Playlist;
import com.richardjiang880.lernchih.model.PlaylistItem;
import com.richardjiang880.lernchih.model.Resource;
import com.richardjiang880.lernchih.repository.PlaylistItemRepository;
import com.richardjiang880.lernchih.repository.PlaylistRepository;
import com.richardjiang880.lernchih.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for study playlists (F2): CRUD on playlists plus ordered
 * item management with simple up/down reordering.
 */
@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final PlaylistItemRepository playlistItemRepository;
    private final ResourceRepository resourceRepository;

    public PlaylistService(PlaylistRepository playlistRepository,
                           PlaylistItemRepository playlistItemRepository,
                           ResourceRepository resourceRepository) {
        this.playlistRepository = playlistRepository;
        this.playlistItemRepository = playlistItemRepository;
        this.resourceRepository = resourceRepository;
    }

    @Transactional
    public PlaylistResponse createPlaylist(Long userId, CreatePlaylistRequest request) {
        Playlist playlist = Playlist.builder()
                .userId(userId)
                .name(request.name())
                .description(request.description())
                .build();
        playlist = playlistRepository.save(playlist);
        return toResponse(playlist, 0);
    }

    @Transactional(readOnly = true)
    public List<PlaylistResponse> listPlaylists(Long userId) {
        return playlistRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(p -> toResponse(p, countItems(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public PlaylistDetailResponse getPlaylist(Long userId, Long playlistId) {
        Playlist playlist = getOwnedPlaylist(userId, playlistId);
        List<PlaylistItemResponse> items = listItems(playlistId);
        return new PlaylistDetailResponse(
                playlist.getId(),
                playlist.getUserId(),
                playlist.getName(),
                playlist.getDescription(),
                playlist.getCreatedAt(),
                items.size(),
                items
        );
    }

    @Transactional
    public PlaylistResponse updatePlaylist(Long userId, Long playlistId, UpdatePlaylistRequest request) {
        Playlist playlist = getOwnedPlaylist(userId, playlistId);
        if (request.name() != null) {
            playlist.setName(request.name());
        }
        if (request.description() != null) {
            playlist.setDescription(request.description());
        }
        playlist = playlistRepository.save(playlist);
        return toResponse(playlist, countItems(playlistId));
    }

    @Transactional
    public void deletePlaylist(Long userId, Long playlistId) {
        Playlist playlist = getOwnedPlaylist(userId, playlistId);
        playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlistId)
                .forEach(playlistItemRepository::delete);
        playlistRepository.delete(playlist);
    }

    @Transactional
    public PlaylistItemResponse addItem(Long userId, Long playlistId, AddItemRequest request) {
        Playlist playlist = getOwnedPlaylist(userId, playlistId);
        Resource resource = resourceRepository.findById(request.resourceId())
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        // Avoid duplicate entries for the same resource.
        if (playlistItemRepository.findByPlaylistIdAndResourceId(playlistId, request.resourceId()).isPresent()) {
            return toItemResponse(playlistItemRepository
                    .findByPlaylistIdAndResourceId(playlistId, request.resourceId()).get());
        }

        List<PlaylistItem> existing = playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlist.getId());
        int nextOrder = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getSortOrder() + 1;

        PlaylistItem item = PlaylistItem.builder()
                .playlistId(playlist.getId())
                .resourceId(resource.getId())
                .sortOrder(nextOrder)
                .build();
        item = playlistItemRepository.save(item);
        return toItemResponse(item);
    }

    @Transactional
    public void removeItem(Long userId, Long playlistId, Long itemId) {
        getOwnedPlaylist(userId, playlistId);
        PlaylistItem item = playlistItemRepository.findById(itemId)
                .filter(i -> playlistId.equals(i.getPlaylistId()))
                .orElseThrow(() -> new IllegalArgumentException("Playlist item not found"));
        playlistItemRepository.delete(item);
    }

    /** Move an item up (toward start) or down (toward end) by swapping sort orders. */
    @Transactional
    public List<PlaylistItemResponse> moveItem(Long userId, Long playlistId, Long itemId, String direction) {
        getOwnedPlaylist(userId, playlistId);
        List<PlaylistItem> items = playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlistId);

        int index = -1;
        for (int i = 0; i < items.size(); i++) {
            if (items.get(i).getId().equals(itemId)) {
                index = i;
                break;
            }
        }
        if (index < 0) {
            throw new IllegalArgumentException("Playlist item not found");
        }

        int target = "up".equalsIgnoreCase(direction) ? index - 1 : index + 1;
        if (target < 0 || target >= items.size()) {
            return items.stream().map(this::toItemResponse).toList();
        }

        PlaylistItem a = items.get(index);
        PlaylistItem b = items.get(target);
        Integer tmp = a.getSortOrder();
        a.setSortOrder(b.getSortOrder());
        b.setSortOrder(tmp);
        playlistItemRepository.save(a);
        playlistItemRepository.save(b);

        return playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlistId).stream()
                .map(this::toItemResponse)
                .toList();
    }

    private List<PlaylistItemResponse> listItems(Long playlistId) {
        return playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlistId).stream()
                .map(this::toItemResponse)
                .toList();
    }

    private int countItems(Long playlistId) {
        return playlistItemRepository.findByPlaylistIdOrderBySortOrderAsc(playlistId).size();
    }

    private Playlist getOwnedPlaylist(Long userId, Long playlistId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new IllegalArgumentException("Playlist not found"));
        if (!playlist.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Playlist not found");
        }
        return playlist;
    }

    private PlaylistResponse toResponse(Playlist p, int itemCount) {
        return new PlaylistResponse(
                p.getId(), p.getUserId(), p.getName(), p.getDescription(), p.getCreatedAt(), itemCount
        );
    }

    private PlaylistItemResponse toItemResponse(PlaylistItem item) {
        String title = resourceRepository.findById(item.getResourceId())
                .map(Resource::getTitle)
                .orElse(null);
        return new PlaylistItemResponse(
                item.getId(), item.getPlaylistId(), item.getResourceId(),
                title, item.getSortOrder(), item.getAddedAt()
        );
    }
}
