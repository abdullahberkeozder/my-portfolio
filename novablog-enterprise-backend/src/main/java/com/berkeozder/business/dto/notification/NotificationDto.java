package com.berkeozder.business.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Date;
import java.util.UUID;

/**
 * WebSocket ve STOMP üzerinden iletilen canlı bildirim veri transfer nesnesi (DTO).
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto implements Serializable {

    private static final long serialVersionUID = 1L;

    @Builder.Default
    private String id = UUID.randomUUID().toString();

    private NotificationType type;
    private String title;
    private String message;
    private String targetUser; // null ise genel broadcast yayınıdır
    private Object payload;    // opsiyonel detaylı nesne (örn: BlogDto, CommentResponseDto)

    @Builder.Default
    private Date timestamp = new Date(System.currentTimeMillis());
}
