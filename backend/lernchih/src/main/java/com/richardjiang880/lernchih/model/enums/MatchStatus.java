package com.richardjiang880.lernchih.model.enums;

/**
 * Lifecycle of a study-buddy suggestion (F39).
 * <ul>
 *   <li>{@code SUGGESTED} — surfaced to the user as a potential buddy.</li>
 *   <li>{@code DISMISSED} — user dismissed; should not be re-suggested.</li>
 *   <li>{@code CONNECTED} — user pressed Connect (a friend request was sent).</li>
 * </ul>
 */
public enum MatchStatus {
    SUGGESTED,
    DISMISSED,
    CONNECTED
}
