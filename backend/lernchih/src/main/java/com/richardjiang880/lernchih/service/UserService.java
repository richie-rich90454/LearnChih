package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.dto.*;
import com.richardjiang880.lernchih.model.Subject;
import com.richardjiang880.lernchih.model.User;
import com.richardjiang880.lernchih.model.UserSocial;
import com.richardjiang880.lernchih.repository.SubjectRepository;
import com.richardjiang880.lernchih.repository.UserRepository;
import com.richardjiang880.lernchih.repository.UserSocialRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
/**
 * Service for user profile management and social links.
 */
public class UserService {

    private final UserRepository userRepository;
    private final UserSocialRepository userSocialRepository;
    private final SubjectRepository subjectRepository;

    public UserService(UserRepository userRepository,
                       UserSocialRepository userSocialRepository,
                       SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.userSocialRepository = userSocialRepository;
        this.subjectRepository = subjectRepository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getMyProfile(User user) {
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        user.setName(request.name());
        user.setBio(request.bio());
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateSubjects(User user, List<Long> subjectIds) {
        List<Subject> subjects = subjectRepository.findAllById(subjectIds);
        user.setSubjects(subjects);
        userRepository.save(user);
        return toProfileResponse(user);
    }

    @Transactional
    public UserSocialDto addSocial(User user, UserSocialRequest request) {
        UserSocial social = UserSocial.builder()
                .user(user)
                .platform(request.platform())
                .url(request.url())
                .build();
        social = userSocialRepository.save(social);
        return new UserSocialDto(social.getId(), social.getPlatform(), social.getUrl());
    }

    @Transactional
    public void removeSocial(Long socialId, User user) {
        UserSocial social = userSocialRepository.findById(socialId)
                .orElseThrow(() -> new IllegalArgumentException("Social link not found"));

        // Ensure users can only delete their own social links
        if (!social.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only remove your own social links");
        }

        userSocialRepository.delete(social);
    }

    private UserProfileResponse toProfileResponse(User user) {
        // Map subject entities to names for the response DTO
        List<String> subjectNames = user.getSubjects().stream()
                .map(Subject::getName)
                .toList();

        List<UserSocialDto> socials = userSocialRepository.findByUserId(user.getId()).stream()
                .map(s -> new UserSocialDto(s.getId(), s.getPlatform(), s.getUrl()))
                .toList();

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getBio(),
                user.getRole().name(),
                user.getCredits(),
                subjectNames,
                socials,
                user.getCreatedAt()
        );
    }
}
