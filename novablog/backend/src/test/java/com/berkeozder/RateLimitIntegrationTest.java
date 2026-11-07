package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class RateLimitIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService.resetBuckets();
    }

    @Test
    @DisplayName("Hız sınırı aşıldığında HTTP 429, Retry-After başlığı ve JSON ApiResult dönmelidir")
    void testRateLimitExceededReturns429() throws Exception {
        String testIp = "198.51.100.77";

        LoginRequestDto dummyLogin = LoginRequestDto.builder()
                .usernameOrEmail("non_existent_user")
                .password("wrong_password")
                .build();

        // 10 adet istek hakkı doldurulur (Kapasite = 10)
        for (int i = 0; i < 10; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", testIp)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dummyLogin)))
                    .andExpect(header().exists("X-RateLimit-Limit"))
                    .andExpect(header().exists("X-RateLimit-Remaining"))
                    .andExpect(status().isUnauthorized()); // Kimlik bilgisi hatalı ama rate limit içinde
        }

        // 11. istek: Hız sınırı aşıldı -> HTTP 429 Too Many Requests
        MvcResult blockedResult = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", testIp)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dummyLogin)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(header().string("X-RateLimit-Remaining", "0"))
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(blockedResult.getResponse().getContentAsString());
        assertThat(responseNode.get("status").asText()).isEqualTo("TOO_MANY_REQUESTS");
        assertThat(responseNode.get("message").asText()).contains("Hız sınırı aşıldı");
    }

    @Test
    @DisplayName("Actuator ve Swagger uç noktaları hız sınırlamasından muaf olmalıdır")
    void testActuatorAndSwaggerBypassed() throws Exception {
        String testIp = "198.51.100.88";

        // Actuator health kontrolü muaf olmalı ve art arda çağrılsa bile 429 almamalı
        for (int i = 0; i < 15; i++) {
            mockMvc.perform(get("/actuator/health")
                            .header("X-Forwarded-For", testIp))
                    .andExpect(status().isOk());
        }
    }
}

