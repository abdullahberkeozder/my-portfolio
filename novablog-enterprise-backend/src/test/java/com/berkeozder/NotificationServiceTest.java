package com.berkeozder;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.business.dto.notification.NotificationType;
import com.berkeozder.business.services.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("NotificationService Unit Tests")
class NotificationServiceTest {

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private NotificationDto sampleNotification;

    @BeforeEach
    void setUp() {
        sampleNotification = NotificationDto.builder()
                .type(NotificationType.BROADCAST)
                .title("Test Başlık")
                .message("Test Mesajı")
                .build();
    }

    @Test
    @DisplayName("1. sendBroadcast: /topic/live-feed hedefine bildirim göndermelidir")
    void shouldSendBroadcastNotification() {
        notificationService.sendBroadcast(sampleNotification);

        verify(messagingTemplate, times(1))
                .convertAndSend(eq(NotificationServiceImpl.TOPIC_LIVE_FEED), eq(sampleNotification));
    }

    @Test
    @DisplayName("2. sendToTopic: Belirtilen özel konuya bildirim göndermelidir")
    void shouldSendToSpecificTopic() {
        String customTopic = "/topic/custom-alerts";
        notificationService.sendToTopic(customTopic, sampleNotification);

        verify(messagingTemplate, times(1))
                .convertAndSend(eq(customTopic), eq(sampleNotification));
    }

    @Test
    @DisplayName("3. sendToUser: Kullanıcıya özel hedefe (/queue/notifications) bildirim iletmelidir")
    void shouldSendToUserQueue() {
        String username = "berkeozder";
        notificationService.sendToUser(username, sampleNotification);

        verify(messagingTemplate, times(1))
                .convertAndSendToUser(eq(username), eq(NotificationServiceImpl.QUEUE_NOTIFICATIONS), eq(sampleNotification));
        assertThat(sampleNotification.getTargetUser()).isEqualTo(username);
    }

    @Test
    @DisplayName("4. notifyBlogCreated: Hem live-feed hem de blogs konusuna bildirim yayınlamalıdır")
    void shouldNotifyBlogCreated() {
        BlogDto blogDto = BlogDto.builder()
                .blogId(1L)
                .title("Spring Boot 2026 Mimarisi")
                .header("Enterprise Spring Boot")
                .build();

        notificationService.notifyBlogCreated(blogDto);

        ArgumentCaptor<NotificationDto> captor = ArgumentCaptor.forClass(NotificationDto.class);

        verify(messagingTemplate, times(1))
                .convertAndSend(eq(NotificationServiceImpl.TOPIC_LIVE_FEED), captor.capture());
        verify(messagingTemplate, times(1))
                .convertAndSend(eq(NotificationServiceImpl.TOPIC_BLOGS), captor.capture());

        NotificationDto sent = captor.getValue();
        assertThat(sent.getType()).isEqualTo(NotificationType.BLOG_CREATED);
        assertThat(sent.getTitle()).isEqualTo("Yeni Blog Yayınlandı!");
        assertThat(sent.getMessage()).contains("Spring Boot 2026 Mimarisi");
    }

    @Test
    @DisplayName("5. notifyCommentCreated: Yorum yapıldığında blog yazarına özel bildirim göndermelidir")
    void shouldNotifyCommentCreated_ToAuthorWhenDifferentFromCommenter() {
        Long blogId = 10L;
        String blogTitle = "Mikroservis Mimarisi";
        String authorUsername = "authorUser";
        String commenterUsername = "readerUser";
        String commentContent = "Harika bir makale!";

        notificationService.notifyCommentCreated(blogId, blogTitle, authorUsername, commenterUsername, commentContent);

        // /topic/comments broadcast
        verify(messagingTemplate, times(1))
                .convertAndSend(eq(NotificationServiceImpl.TOPIC_COMMENTS), any(NotificationDto.class));

        // Blog yazarına direkt bildirim
        ArgumentCaptor<NotificationDto> userCaptor = ArgumentCaptor.forClass(NotificationDto.class);
        verify(messagingTemplate, times(1))
                .convertAndSendToUser(eq(authorUsername), eq(NotificationServiceImpl.QUEUE_NOTIFICATIONS), userCaptor.capture());

        NotificationDto authorNotification = userCaptor.getValue();
        assertThat(authorNotification.getTargetUser()).isEqualTo(authorUsername);
        assertThat(authorNotification.getMessage()).contains(commenterUsername);
    }

    @Test
    @DisplayName("6. notifyCommentCreated: Blog yazarı kendi yazısına yorum yaptığında kendine bildirim göndermemelidir")
    void shouldNotSendAuthorNotification_WhenAuthorCommentsOnOwnBlog() {
        Long blogId = 10L;
        String blogTitle = "Mikroservis Mimarisi";
        String authorUsername = "authorUser";
        String commenterUsername = "authorUser"; // Aynı kullanıcı

        notificationService.notifyCommentCreated(blogId, blogTitle, authorUsername, commenterUsername, "Kendi yorumum");

        // /topic/comments yayınlanmalı
        verify(messagingTemplate, times(1))
                .convertAndSend(eq(NotificationServiceImpl.TOPIC_COMMENTS), any(NotificationDto.class));

        // Kendine özel kuyruk mesajı gönderilmemeli
        verify(messagingTemplate, never())
                .convertAndSendToUser(anyString(), anyString(), any(NotificationDto.class));
    }
}

