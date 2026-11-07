package com.berkeozder;

import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AI Comment Pre-Moderation & Sentiment Integration Tests")
public class CommentAiModerationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

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
                        .header("X-Forwarded-For", "192.168.140.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("Polite comment should be automatically approved with POSITIVE sentiment")
    void politeComment_shouldBeAutoApprovedWithPositiveSentiment() throws Exception {
        String token = getAdminToken();

        CommentCreateRequestDto request = CommentCreateRequestDto.builder()
                .content("Harika ve son derece öğretici bir yazı, ellerinize sağlık çok teşekkürler!")
                .build();

        MvcResult result = mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.approved").value(true))
                .andExpect(jsonPath("$.data.isAiModerated").value(true))
                .andExpect(jsonPath("$.data.sentiment").value("POSITIVE"))
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        double toxicity = node.get("data").get("toxicityScore").asDouble();
        assertThat(toxicity).isLessThan(0.20);
    }

    @Test
    @DisplayName("Toxic comment should be flagged and kept unapproved (isApproved=false) for admin review")
    void toxicComment_shouldBeHeldForModerationWithHighToxicity() throws Exception {
        String token = getAdminToken();

        CommentCreateRequestDto request = CommentCreateRequestDto.builder()
                .content("Bu ne rezalet bir makale, yazar tam bir aptal ve dolandırıcı!")
                .build();

        MvcResult result = mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.approved").value(false))
                .andExpect(jsonPath("$.data.isAiModerated").value(true))
                .andExpect(jsonPath("$.data.sentiment").value("NEGATIVE"))
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        double toxicity = node.get("data").get("toxicityScore").asDouble();
        assertThat(toxicity).isGreaterThanOrEqualTo(0.65);
    }
}
