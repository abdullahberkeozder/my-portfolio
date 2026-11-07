package com.berkeozder.business.event.listener;

import com.berkeozder.business.event.CommentCreatedEvent;
import com.berkeozder.business.event.UserRegisteredEvent;
import com.berkeozder.business.services.interfaces.IEmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Log4j2
@RequiredArgsConstructor
@Component
public class NotificationEventListener {

    private final IEmailService emailService;

    @Async("taskExecutor")
    @EventListener
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("Asenkron Bildirim Tetiklendi [UserRegisteredEvent] - Kullanıcı: {}, Thread: {}",
                event.getUsername(), Thread.currentThread().getName());
        emailService.sendWelcomeEmail(event.getEmail(), event.getUsername(), event.getFullName());
    }

    @Async("taskExecutor")
    @EventListener
    public void handleCommentCreatedEvent(CommentCreatedEvent event) {
        log.info("Asenkron Bildirim Tetiklendi [CommentCreatedEvent] - Blog ID: {}, Yorum Yapan: {}, Thread: {}",
                event.getBlogId(), event.getCommenterUsername(), Thread.currentThread().getName());
        emailService.sendCommentNotificationEmail(
                event.getAuthorEmail(),
                event.getAuthorUsername(),
                event.getBlogTitle(),
                event.getCommenterUsername(),
                event.getCommentContent()
        );
    }
}

