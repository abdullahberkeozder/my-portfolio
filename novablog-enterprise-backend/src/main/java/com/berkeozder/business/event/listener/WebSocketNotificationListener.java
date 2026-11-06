package com.berkeozder.business.event.listener;

import com.berkeozder.business.event.BlogCreatedEvent;
import com.berkeozder.business.event.CommentCreatedEvent;
import com.berkeozder.business.services.interfaces.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Spring uygulama olaylarını dinleyerek gerçek zamanlı WebSocket kanallarına
 * (/topic/live-feed, /topic/blogs, /topic/comments, /user/queue/notifications)
 * anlık STOMP mesajları dağıtan dinleyici bileşen.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class WebSocketNotificationListener {

    private final INotificationService notificationService;

    @EventListener
    public void handleCommentCreated(CommentCreatedEvent event) {
        log.info("WebSocket: CommentCreatedEvent işleniyor -> Blog: '{}', Yazar: '{}', Yorum Yapan: '{}'",
                event.getBlogTitle(), event.getAuthorUsername(), event.getCommenterUsername());
        notificationService.notifyCommentCreated(
                event.getBlogId(),
                event.getBlogTitle(),
                event.getAuthorUsername(),
                event.getCommenterUsername(),
                event.getCommentContent()
        );
    }

    @EventListener
    public void handleBlogCreated(BlogCreatedEvent event) {
        log.info("WebSocket: BlogCreatedEvent işleniyor -> Blog: '{}'", event.getBlogDto().getTitle());
        notificationService.notifyBlogCreated(event.getBlogDto());
    }
}

