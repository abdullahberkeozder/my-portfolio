package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.services.interfaces.IEmailService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AsyncNotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoSpyBean
    private IEmailService emailService;

    @Test
    @DisplayName("Kullanıcı kaydı sonrasında asenkron hoş geldin e-postası tetiklenmelidir")
    void testAsyncWelcomeEmailOnRegister() throws Exception {
        long timestamp = System.currentTimeMillis();
        RegisterRequestDto request = RegisterRequestDto.builder()
                .username("async_user_" + timestamp)
                .email("async_" + timestamp + "@test.com")
                .password("Password123!")
                .firstName("Async")
                .lastName("Tester")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        // Asenkron event dinleyicisinin emailService'i çağırdığını doğrula (max 3 sn bekle)
        verify(emailService, timeout(3000).atLeastOnce()).sendWelcomeEmail(
                request.getEmail(),
                request.getUsername(),
                "Async Tester"
        );
    }

    @Test
    @DisplayName("Yorum eklenmesi sonrasında asenkron yorum bildirim eventi tetiklenmelidir")
    void testAsyncCommentNotificationOnNewComment() throws Exception {
        // Admin girişi yap
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("root")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginNode.get("data").get("accessToken").asText();

        // Blog 1'e yorum ekle
        CommentCreateRequestDto commentRequest = CommentCreateRequestDto.builder()
                .content("Asenkron bildirim testi için örnek yorum içeriği.")
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isCreated());

        // Asenkron listener tetiklenmeli
        verify(emailService, timeout(3000).atLeastOnce()).sendCommentNotificationEmail(
                nullable(String.class),
                nullable(String.class),
                eq("Title-1"),
                eq("admin"),
                contains("Asenkron bildirim testi")
        );
    }
}
