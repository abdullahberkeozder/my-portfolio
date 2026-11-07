package com.berkeozder.controller.api.interfaces;

import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.error.ApiResult;
import org.springframework.http.ResponseEntity;

import java.util.List;

/**
 * WebSocket ve Gerçek Zamanlı Bildirim REST API Sözleşmesi.
 *
 * @author Berke Özder
 */
public interface INotificationApi {

    /**
     * Tüm istemcilere anlık genel duyuru/broadcast bildirimi gönderir (Admin).
     */
    ResponseEntity<ApiResult<NotificationDto>> sendBroadcastNotification(NotificationDto notificationDto);

    /**
     * Belirli bir kullanıcıya doğrudan özel bildirim iletir (Admin).
     */
    ResponseEntity<ApiResult<NotificationDto>> sendUserNotification(String username, NotificationDto notificationDto);

    /**
     * Sistemde desteklenen bildirim tiplerini döner.
     */
    ResponseEntity<ApiResult<List<String>>> getNotificationTypes();

    /**
     * Canlı akış (live-feed) kanalını test etmek için anlık test bildirimi tetikler.
     */
    ResponseEntity<ApiResult<NotificationDto>> triggerTestNotification();
}

