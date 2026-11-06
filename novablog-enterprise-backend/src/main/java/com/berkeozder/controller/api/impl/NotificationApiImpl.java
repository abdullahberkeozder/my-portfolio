package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.business.dto.notification.NotificationType;
import com.berkeozder.business.services.interfaces.INotificationService;
import com.berkeozder.controller.api.interfaces.INotificationApi;
import com.berkeozder.error.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Gerçek Zamanlı Bildirim (WebSocket / STOMP) REST API Controller.
 *
 * @author Berke Özder
 */
@Log4j2
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Notification & WebSocket API", description = "Gerçek zamanlı canlı bildirim ve duyuru yönetimi")
public class NotificationApiImpl implements INotificationApi {

    private final INotificationService notificationService;

    @Override
    @PostMapping("/broadcast")
    @Operation(summary = "Genel Duyuru / Broadcast Gönder", description = "Tüm aktif WebSocket abonelerine (/topic/live-feed) anlık genel bildirim iletir.")
    public ResponseEntity<ApiResult<NotificationDto>> sendBroadcastNotification(@RequestBody NotificationDto notificationDto) {
        if (notificationDto.getId() == null) {
            notificationDto.setId(UUID.randomUUID().toString());
        }
        if (notificationDto.getType() == null) {
            notificationDto.setType(NotificationType.BROADCAST);
        }
        if (notificationDto.getTimestamp() == null) {
            notificationDto.setTimestamp(new Date(System.currentTimeMillis()));
        }

        notificationService.sendBroadcast(notificationDto);
        return ResponseEntity.ok(ApiResult.success(notificationDto));
    }

    @Override
    @PostMapping("/user/{username}")
    @Operation(summary = "Kullanıcıya Özel Bildirim Gönder", description = "Belirtilen kullanıcıya özel (/user/{username}/queue/notifications) bildirim iletir.")
    public ResponseEntity<ApiResult<NotificationDto>> sendUserNotification(
            @PathVariable("username") String username,
            @RequestBody NotificationDto notificationDto
    ) {
        if (notificationDto.getId() == null) {
            notificationDto.setId(UUID.randomUUID().toString());
        }
        if (notificationDto.getType() == null) {
            notificationDto.setType(NotificationType.INFO);
        }
        if (notificationDto.getTimestamp() == null) {
            notificationDto.setTimestamp(new Date(System.currentTimeMillis()));
        }
        notificationDto.setTargetUser(username);

        notificationService.sendToUser(username, notificationDto);
        return ResponseEntity.ok(ApiResult.success(notificationDto));
    }

    @Override
    @GetMapping("/types")
    @Operation(summary = "Desteklenen Bildirim Tipleri", description = "Sistemdeki tüm bildirim tiplerinin listesini döner.")
    public ResponseEntity<ApiResult<List<String>>> getNotificationTypes() {
        List<String> types = Arrays.stream(NotificationType.values())
                .map(Enum::name)
                .toList();
        return ResponseEntity.ok(ApiResult.success(types));
    }

    @Override
    @PostMapping("/test")
    @Operation(summary = "Canlı Bildirim Testi", description = "WebSocket canlı akışını doğrulamak için test yayını tetikler.")
    public ResponseEntity<ApiResult<NotificationDto>> triggerTestNotification() {
        Date now = new Date(System.currentTimeMillis());
        NotificationDto testNotification = NotificationDto.builder()
                .id(UUID.randomUUID().toString())
                .type(NotificationType.SYSTEM_ALERT)
                .title("Sistem Canlı Bildirim Testi")
                .message("WebSocket & STOMP bağlantısı başarıyla çalışıyor! Zaman: " + now)
                .timestamp(now)
                .build();

        notificationService.sendBroadcast(testNotification);
        return ResponseEntity.ok(ApiResult.success(testNotification));
    }
}
