package com.richardjiang880.lernchih.model.enums;

/**
 * Role of a user within a cohort (F40).
 * <ul>
 *   <li>{@code LEADER} — the cohort creator; can manage the cohort.</li>
 *   <li>{@code MEMBER} — a regular participant who joined the cohort.</li>
 * </ul>
 */
public enum CohortRole {
    LEADER,
    MEMBER
}
