package com.berkeozder.business.services.impl;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.business.dto.notification.NotificationType;
import com.berkeozder.business.services.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.UUID;

/**
 * WebSocket ve STOMP Mesajlaşma Servisi Gerçekleştirmesi.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements INotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public static final String TOPIC_LIVE_FEED = "/topic/live-feed";
    public static final String TOPIC_BLOGS = "/topic/blogs";
    public static final String TOPIC_COMMENTS = "/topic/comments";
    public static final String QUEUE_NOTIFICATIONS = "/queue/notifications";

    @Override
    public void sendBroadcast(NotificationDto notification) {
        log.info("WebSocket Broadcast -> {}: {}", TOPIC_LIVE_FEED, notification.getTitle());
        messagingTemplate.convertAndSend(TOPIC_LIVE_FEED, notification);
    }

    @Override
    public void sendToTopic(String topic, NotificationDto notification) {
        log.info("WebSocket Topic -> {}: {}", topic, notification.getTitle());
        messagingTemplate.convertAndSend(topic, notification);
    }

    @Override
    public void sendToUser(String username, NotificationDto notification) {
        if (username != null && !username.isBlank()) {
            log.info("WebSocket Kullanıcı Bildirimi -> {} [{}]: {}", username, QUEUE_NOTIFICATIONS, notification.getTitle());
            notification.setTargetUser(username);
            messagingTemplate.convertAndSendToUser(username, QUEUE_NOTIFICATIONS, notification);
        }
    }

    @Override
    public void notifyBlogCreated(BlogDto blogDto) {
        String title = (blogDto.getTitle() != null && !blogDto.getTitle().isBlank())
                ? blogDto.getTitle() : blogDto.getHeader();

        NotificationDto notification = NotificationDto.builder()
                .id(UUID.randomUUID().toString())
                .type(NotificationType.BLOG_CREATED)
                .title("Yeni Blog Yayınlandı!")
                .message("'" + title + "' başlıklı yeni bir blog yazısı paylaşıldı.")
                .payload(blogDto)
                .timestamp(new Date(System.currentTimeMillis()))
                .build();

        sendBroadcast(notification);
        sendToTopic(TOPIC_BLOGS, notification);
    }

    @Override
    public void notifyCommentCreated(Long blogId, String blogTitle, String authorUsername, String commenterUsername, String commentContent) {
        NotificationDto broadcastNotification = NotificationDto.builder()
                .id(UUID.randomUUID().toString())
                .type(NotificationType.COMMENT_ADDED)
                .title("Yeni Yorum Eklendi")
                .message(commenterUsername + ", '" + blogTitle + "' yazısına yorum yaptı.")
                .timestamp(new Date(System.currentTimeMillis()))
                .build();

        sendToTopic(TOPIC_COMMENTS, broadcastNotification);

        // Blog yazarına özel bildirim gönder (kendi yorumu değilse)
        if (authorUsername != null && !authorUsername.equalsIgnoreCase(commenterUsername)) {
            NotificationDto authorNotification = NotificationDto.builder()
                    .id(UUID.randomUUID().toString())
                    .type(NotificationType.COMMENT_ADDED)
                    .title("Blogunuza Yeni Yorum Geldi!")
                    .message(commenterUsername + " '" + blogTitle + "' yazınıza yorum yaptı: " + commentContent)
                    .targetUser(authorUsername)
                    .timestamp(new Date(System.currentTimeMillis()))
                    .build();

            sendToUser(authorUsername, authorNotification);
        }
    }

    @Override
    public NotificationDto createNotification(NotificationType type, String title, String message, Object payload) {
        return NotificationDto.builder()
                .id(UUID.randomUUID().toString())
                .type(type)
                .title(title)
                .message(message)
                .payload(payload)
                .timestamp(new Date(System.currentTimeMillis()))
                .build();
    }
}
