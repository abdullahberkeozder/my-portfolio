package com.berkeozder.business.services.impl;

import com.berkeozder.business.services.interfaces.IEmailService;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

@Log4j2
@Service
public class EmailServiceImpl implements IEmailService {

    @Override
    public void sendWelcomeEmail(String toEmail, String username, String fullName) {
        String displayName = (fullName != null && !fullName.isBlank()) ? fullName : username;
        log.info("==================== [E-POSTA BİLDİRİMİ] ====================");
        log.info("Kime       : {}", toEmail);
        log.info("Konu       : Spring Boot 2026 Blog Platformuna Hoş Geldiniz!");
        log.info("İçerik     : Sayın {}, hesabınız başarıyla oluşturuldu. Keyifli okumalar dileriz!", displayName);
        log.info("Thread     : {}", Thread.currentThread().getName());
        log.info("=============================================================");
    }

    @Override
    public void sendCommentNotificationEmail(
            String authorEmail,
            String authorUsername,
            String blogTitle,
            String commenterUsername,
            String commentContent
    ) {
        if (authorEmail == null || authorEmail.isBlank()) {
            log.warn("Blog yazarının e-posta adresi bulunmadığı için yorum bildirimi gönderilemedi: Yazar={}", authorUsername);
            return;
        }

        log.info("==================== [YORUM BİLDİRİMİ] ====================");
        log.info("Kime       : {}", authorEmail);
        log.info("Konu       : Yazınıza Yeni Bir Yorum Yapıldı: '{}'", blogTitle);
        log.info("Gönderen   : {}", commenterUsername);
        log.info("Yorum      : \"{}\"", commentContent);
        log.info("Thread     : {}", Thread.currentThread().getName());
        log.info("============================================================");
    }
}

