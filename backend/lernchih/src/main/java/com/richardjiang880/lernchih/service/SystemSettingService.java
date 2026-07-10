package com.richardjiang880.lernchih.service;

import com.richardjiang880.lernchih.model.SystemSetting;
import com.richardjiang880.lernchih.repository.SystemSettingRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for reading and updating platform-wide system settings.
 *
 * The maintenance banner is the primary consumer: the
 * {@code MaintenanceBanner} frontend component reads the
 * {@code maintenance_banner} setting (a JSON string) via the public read
 * endpoint, while admins update it via the admin endpoint.
 */
@Service
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    public SystemSettingService(SystemSettingRepository systemSettingRepository) {
        this.systemSettingRepository = systemSettingRepository;
    }

    public List<SystemSetting> findAll() {
        return systemSettingRepository.findAll();
    }

    public Optional<SystemSetting> findByKey(String key) {
        return systemSettingRepository.findBySettingKey(key);
    }

    public SystemSetting setValue(String key, String value) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(key)
                        .build());
        setting.setSettingValue(value);
        return systemSettingRepository.save(setting);
    }
}
