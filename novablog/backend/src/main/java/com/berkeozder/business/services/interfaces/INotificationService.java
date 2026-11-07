package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.business.dto.notification.NotificationType;

/**
 * Gerçek Zamanlı Bildirim ve WebSocket İletişim Servis Sözleşmesi.
 *
 * @author Berke Özder
 */
public interface INotificationService {

    /**
     * Tüm aktif abonelere genel canlı akış (/topic/live-feed) yayını gönderir.
     */
    void sendBroadcast(NotificationDto notification);

    /**
     * Belirli bir konuya (/topic/...) bildirim gönderir.
     */
    void sendToTopic(String topic, NotificationDto notification);

    /**
     * Belirli bir kullanıcıya özel (/user/{username}/queue/notifications) bildirim gönderir.
     */
    void sendToUser(String username, NotificationDto notification);

    /**
     * Yeni bir blog oluşturulduğunda ilgili kanallara otomatik yayın yapar.
     */
    void notifyBlogCreated(BlogDto blogDto);

    /**
     * Yeni bir yorum eklendiğinde genel akışa ve blog yazarına otomatik bildirim iletir.
     */
    void notifyCommentCreated(Long blogId, String blogTitle, String authorUsername, String commenterUsername, String commentContent);

    /**
     * Hızlı bildirim DTO nesnesi üretir.
     */
    NotificationDto createNotification(NotificationType type, String title, String message, Object payload);
}

