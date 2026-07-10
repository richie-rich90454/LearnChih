package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.GroupEventDtos;
import com.richardjiang880.lernchih.model.EventRsvp;
import com.richardjiang880.lernchih.model.GroupEvent;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.enums.RsvpStatus;
import com.richardjiang880.lernchih.repository.EventRsvpRepository;
import com.richardjiang880.lernchih.repository.GroupEventRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Group event lifecycle (F41): create events for a study group,
 * RSVP, list attendees, and delete (creator only).
 */
@Service
public class GroupEventService {

    private final GroupEventRepository groupEventRepository;
    private final EventRsvpRepository eventRsvpRepository;
    private final UserRepository userRepository;

    public GroupEventService(GroupEventRepository groupEventRepository,
                             EventRsvpRepository eventRsvpRepository,
                             UserRepository userRepository) {
        this.groupEventRepository = groupEventRepository;
        this.eventRsvpRepository = eventRsvpRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<GroupEventDtos.GroupEventResponse> listByGroup(Long groupId, User viewer) {
        List<GroupEvent> events = groupEventRepository.findByGroupIdOrderByStartTimeAsc(groupId);
        return events.stream().map(e -> toResponse(e, viewer)).toList();
    }

    @Transactional
    public GroupEventDtos.GroupEventResponse create(Long groupId,
                                                    GroupEventDtos.CreateEventRequest request,
                                                    User creator) {
        if (request.title() == null || request.title().isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }
        if (request.startTime() == null) {
            throw new IllegalArgumentException("Start time is required");
        }
        GroupEvent event = GroupEvent.builder()
                .groupId(groupId)
                .title(request.title())
                .description(request.description())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .location(request.location())
                .meetingUrl(request.meetingUrl())
                .createdBy(creator.getId())
                .build();
        event = groupEventRepository.save(event);
        return toResponse(event, creator);
    }

    @Transactional
    public GroupEventDtos.GroupEventResponse updateRsvp(Long eventId,
                                                        String statusStr,
                                                        User user) {
        GroupEvent event = groupEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        RsvpStatus status;
        try {
            status = RsvpStatus.valueOf(statusStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid RSVP status: " + statusStr);
        }
        EventRsvp rsvp = eventRsvpRepository.findByEventIdAndUserId(eventId, user.getId())
                .orElseGet(() -> EventRsvp.builder()
                        .eventId(eventId)
                        .userId(user.getId())
                        .build());
        rsvp.setStatus(status);
        eventRsvpRepository.save(rsvp);
        return toResponse(event, user);
    }

    @Transactional(readOnly = true)
    public List<GroupEventDtos.RsvpResponse> listRsvps(Long eventId) {
        if (!groupEventRepository.existsById(eventId)) {
            throw new IllegalArgumentException("Event not found");
        }
        List<EventRsvp> rsvps = eventRsvpRepository.findByEventIdOrderByRespondedAtAsc(eventId);
        if (rsvps.isEmpty()) {
            return List.of();
        }
        List<Long> userIds = rsvps.stream().map(EventRsvp::getUserId).toList();
        Map<Long, String> nameById = new HashMap<>();
        userRepository.findAllById(userIds).forEach(u -> nameById.put(u.getId(), u.getName()));
        return rsvps.stream()
                .map(r -> new GroupEventDtos.RsvpResponse(
                        r.getId(),
                        r.getEventId(),
                        r.getUserId(),
                        nameById.getOrDefault(r.getUserId(), "Unknown"),
                        r.getStatus().name(),
                        r.getRespondedAt()))
                .toList();
    }

    @Transactional
    public void delete(Long eventId, User user) {
        GroupEvent event = groupEventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));
        if (!event.getCreatedBy().equals(user.getId())) {
            throw new IllegalStateException("Only the event creator can delete it");
        }
        groupEventRepository.delete(event);
    }

    private GroupEventDtos.GroupEventResponse toResponse(GroupEvent event, User viewer) {
        int going = (int) eventRsvpRepository.countByEventIdAndStatus(event.getId(), RsvpStatus.GOING);
        int maybe = (int) eventRsvpRepository.countByEventIdAndStatus(event.getId(), RsvpStatus.MAYBE);
        int notGoing = (int) eventRsvpRepository.countByEventIdAndStatus(event.getId(), RsvpStatus.NOT_GOING);
        String viewerStatus = eventRsvpRepository.findByEventIdAndUserId(event.getId(), viewer.getId())
                .map(r -> r.getStatus().name())
                .orElse(null);
        String creatorName = userRepository.findById(event.getCreatedBy())
                .map(User::getName)
                .orElse("Unknown");
        return new GroupEventDtos.GroupEventResponse(
                event.getId(),
                event.getGroupId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartTime(),
                event.getEndTime(),
                event.getLocation(),
                event.getMeetingUrl(),
                event.getCreatedBy(),
                creatorName,
                going,
                maybe,
                notGoing,
                viewerStatus,
                event.getCreatedAt());
    }
}
