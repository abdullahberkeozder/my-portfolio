package com.berkeozder;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.notification.NotificationDto;
import com.berkeozder.business.dto.notification.NotificationType;
import com.berkeozder.business.event.BlogCreatedEvent;
import com.berkeozder.business.event.CommentCreatedEvent;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("WebSocket & Notification Integration Tests")
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    @Autowired
    private ApplicationEventPublisher eventPublisher;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }
    }

    private String getAdminToken() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("root")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "192.168.180.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("1. Bildirim Tipleri: GET /api/v1/notifications/types herkese açık dönmelidir")
    void shouldReturnNotificationTypes() throws Exception {
        mockMvc.perform(get("/api/v1/notifications/types")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[?(@ == 'BLOG_CREATED')]").exists())
                .andExpect(jsonPath("$.data[?(@ == 'COMMENT_ADDED')]").exists())
                .andExpect(jsonPath("$.data[?(@ == 'BROADCAST')]").exists())
                .andExpect(jsonPath("$.data[?(@ == 'SYSTEM_ALERT')]").exists());
    }

    @Test
    @DisplayName("2. Test Bildirimi: POST /api/v1/notifications/test canlı akışa test bildirimi yaymalıdır")
    void shouldTriggerTestNotification() throws Exception {
        mockMvc.perform(post("/api/v1/notifications/test")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.type").value("SYSTEM_ALERT"))
                .andExpect(jsonPath("$.data.title").value("Sistem Canlı Bildirim Testi"));
    }

    @Test
    @DisplayName("3. Broadcast Yetkisiz İstek: Yetkisiz kullanıcı POST /broadcast çağırdığında 401 dönmelidir")
    void shouldDenyBroadcastWithoutAuth() throws Exception {
        NotificationDto notification = NotificationDto.builder()
                .type(NotificationType.BROADCAST)
                .title("Yetkisiz Duyuru")
                .message("Bu mesaj gitmemeli")
                .build();

        mockMvc.perform(post("/api/v1/notifications/broadcast")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notification)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. Admin Broadcast: Admin yetkisiyle POST /broadcast başarıyla çalışmalıdır")
    void shouldSendBroadcastWithAdminToken() throws Exception {
        String token = getAdminToken();

        NotificationDto notification = NotificationDto.builder()
                .type(NotificationType.BROADCAST)
                .title("Sistem Bakım Duyurusu")
                .message("Sistem bu gece saat 02:00'de bakıma alınacaktır.")
                .build();

        mockMvc.perform(post("/api/v1/notifications/broadcast")
                        .header("Authorization", "Bearer " + token)
                        .header("X-Forwarded-For", "192.168.180.2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notification)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.title").value("Sistem Bakım Duyurusu"))
                .andExpect(jsonPath("$.data.type").value("BROADCAST"));
    }

    @Test
    @DisplayName("5. Kullanıcıya Özel Bildirim: Admin yetkisiyle POST /user/{username} başarıyla çalışmalıdır")
    void shouldSendUserNotificationWithAdminToken() throws Exception {
        String token = getAdminToken();

        NotificationDto notification = NotificationDto.builder()
                .type(NotificationType.INFO)
                .title("Tebrikler!")
                .message("Blog yazınız editörler tarafından günün yazısı seçildi.")
                .build();

        mockMvc.perform(post("/api/v1/notifications/user/berke")
                        .header("Authorization", "Bearer " + token)
                        .header("X-Forwarded-For", "192.168.180.3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(notification)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.targetUser").value("berke"))
                .andExpect(jsonPath("$.data.title").value("Tebrikler!"));
    }

    @Test
    @DisplayName("6. Event Listener Entegrasyonu: BlogCreatedEvent ve CommentCreatedEvent hatasız tetiklenmelidir")
    void shouldHandleEventsWithoutException() {
        BlogDto sampleBlog = BlogDto.builder()
                .blogId(999L)
                .title("Event Test Blogu")
                .build();

        eventPublisher.publishEvent(new BlogCreatedEvent(this, sampleBlog));

        eventPublisher.publishEvent(new CommentCreatedEvent(
                this,
                888L,
                999L,
                "Event Test Blogu",
                "author@test.com",
                "authorUser",
                "commenterUser",
                "Harika bir yazı!"
        ));
    }
}

