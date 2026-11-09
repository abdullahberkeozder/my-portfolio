package com.berkeozder;

import com.berkeozder.ai.dto.AiSummaryRequestDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * RFC 7807 Problem Details Entegrasyon Testleri.
 *
 * @author Berke Özder
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProblemDetailsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Doğrulama hatası oluştuğunda RFC 7807 formatında application/problem+json dönmelidir")
    void testValidationFailureReturnsRfc7807ProblemDetail() throws Exception {
        // text alanı @NotBlank olduğu için boş gönderilerek validation hatası tetiklenir
        AiSummaryRequestDto invalidRequest = AiSummaryRequestDto.builder()
                .title("Geçersiz İstek")
                .text("") // Boş metin validation'a takılır
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.has("type")).isTrue();
        assertThat(json.get("title").asText()).isEqualTo("Validation Failed");
        assertThat(json.get("status").asInt()).isEqualTo(400);
        assertThat(json.has("errors")).isTrue();
        assertThat(json.get("errors").has("text")).isTrue();
    }
}
