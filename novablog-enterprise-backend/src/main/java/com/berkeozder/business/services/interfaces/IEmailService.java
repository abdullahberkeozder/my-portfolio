package com.berkeozder.business.services.interfaces;

public interface IEmailService {

    void sendWelcomeEmail(String toEmail, String username, String fullName);

    void sendCommentNotificationEmail(
            String authorEmail,
            String authorUsername,
            String blogTitle,
            String commenterUsername,
            String commentContent
    );
}

