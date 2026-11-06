package com.berkeozder.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Enterprise WebSocket ve STOMP Mesajlaşma Konfigürasyonu.
 *
 * Canlı bildirimler, duyurular ve aktivite akışı için in-memory Simple Message Broker tanımlar.
 * STOMP endpoint'i /ws üzerinden SockJS fallback ve doğrudan WebSocket desteği sunar.
 *
 * Kanallar:
 * - /topic/live-feed  : Herkese açık anlık sistem ve aktivite akışı
 * - /topic/blogs      : Yeni ve güncellenen blog yayın bildirimleri
 * - /topic/comments   : Yorum bildirimleri akışı
 * - /user/queue/notifications : Kullanıcıya özel bireysel bildirimler
 *
 * @author Berke Özder
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // SockJS fallback ile tarayıcı uyumlu endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();

        // Saf WebSocket istemcileri (Mobil, Postman, CLI) için doğrudan endpoint
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // İstemcilerin abone olabileceği kanallar (/topic -> broadcast, /queue -> bireysel)
        registry.enableSimpleBroker("/topic", "/queue");

        // İstemcilerden sunucuya gönderilecek mesajların prefix'i
        registry.setApplicationDestinationPrefixes("/app");

        // Kullanıcıya özel hedefler için prefix (örn: /user/{username}/queue/notifications)
        registry.setUserDestinationPrefix("/user");
    }
}

