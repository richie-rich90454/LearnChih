package com.richardjiang880.lernchih.model;

/**
 * Discriminator for polymorphic references to posts/threads, since the schema
 * keeps resource and channel content in separate tables (resource_posts /
 * channel_posts, resource_threads / channel_threads). Stored as a STRING so
 * the value remains readable in the database.
 */
public enum PostType {
    RESOURCE,
    CHANNEL
}
