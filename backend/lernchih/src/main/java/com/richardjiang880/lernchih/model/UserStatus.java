package com.richardjiang880.lernchih.model;

/**
 * Account status for a user, managed by administrators.
 *
 * <ul>
 *   <li>{@link #ACTIVE} - normal access</li>
 *   <li>{@link #SUSPENDED} - temporarily restricted (cannot log in)</li>
 *   <li>{@link #BANNED} - permanently restricted (cannot log in)</li>
 * </ul>
 */
public enum UserStatus {
    ACTIVE,
    SUSPENDED,
    BANNED
}
