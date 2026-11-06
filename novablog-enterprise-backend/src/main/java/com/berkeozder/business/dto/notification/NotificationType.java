package com.berkeozder.business.dto.notification;

/**
 * WebSocket üzerinden iletilen bildirim tipleri.
 *
 * @author Berke Özder
 */
public enum NotificationType {
    INFO,
    BLOG_CREATED,
    BLOG_UPDATED,
    BLOG_DELETED,
    COMMENT_ADDED,
    BROADCAST,
    SYSTEM_ALERT
}

