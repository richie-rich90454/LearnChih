package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.FeatureFlag;
import com.richardjiang880.lernchih.repository.FeatureFlagRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for querying and toggling platform feature flags.
 *
 * Other services call {@link #isEnabled} to check whether a feature is
 * active. The admin feature-flags page calls {@link #findAll} and
 * {@link #setEnabled} to list and toggle flags.
 */
@Service
public class FeatureFlagService {

    private final FeatureFlagRepository featureFlagRepository;

    public FeatureFlagService(FeatureFlagRepository featureFlagRepository) {
        this.featureFlagRepository = featureFlagRepository;
    }

    public List<FeatureFlag> findAll() {
        return featureFlagRepository.findAll();
    }

    public Optional<FeatureFlag> findByKey(String key) {
        return featureFlagRepository.findByFlagKey(key);
    }

    public FeatureFlag setEnabled(String key, boolean enabled) {
        FeatureFlag flag = featureFlagRepository.findByFlagKey(key)
                .orElseThrow(() -> new IllegalArgumentException("Feature flag not found: " + key));
        flag.setEnabled(enabled);
        return featureFlagRepository.save(flag);
    }

    public boolean isEnabled(String key) {
        return featureFlagRepository.findByFlagKey(key)
                .map(FeatureFlag::getEnabled)
                .orElse(false);
    }
}
