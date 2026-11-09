package com.berkeozder;

import com.berkeozder.ai.dto.AiSummaryRequestDto;
import com.berkeozder.resilience.idempotency.IdempotencyFilter;
import com.berkeozder.resilience.idempotency.IdempotencyStorage;
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

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * X-Idempotency-Key Uçtan Uca Entegrasyon Testleri.
 * Ağ kopmalarında mükerrer istekleri önler ve aynı yanıtı güvenle önbellekten döner.
 *
 * @author Berke Özder
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IdempotencyIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IdempotencyStorage idempotencyStorage;

    @Test
    @DisplayName("X-Idempotency-Key ile ilk istek çalıştırılmalı (EXECUTED), ikinci istek önbellekten (CACHED) dönmelidir")
    void testIdempotentExecutionAndCacheHit() throws Exception {
        String idempotencyKey = UUID.randomUUID().toString();

        AiSummaryRequestDto requestDto = AiSummaryRequestDto.builder()
                .title("Java 22 Loom")
                .text("Java 22 sanal iş parçacıkları yüksek eşzamanlılık sağlar.")
                .build();

        String payload = objectMapper.writeValueAsString(requestDto);

        // 1. İstek: İlk defa yürütülür (EXECUTED)
        MvcResult firstResult = mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .header(IdempotencyFilter.IDEMPOTENCY_HEADER, idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(header().string(IdempotencyFilter.STATUS_HEADER, "EXECUTED"))
                .andReturn();

        String firstBody = firstResult.getResponse().getContentAsString();
        assertThat(firstBody).contains("Java 22");

        // 2. İstek: Aynı anahtar ile gönderilir -> İş mantığı tekrar çalışmaz, önbellekten döner (CACHED)
        MvcResult secondResult = mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .header(IdempotencyFilter.IDEMPOTENCY_HEADER, idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(header().string(IdempotencyFilter.STATUS_HEADER, "CACHED"))
                .andReturn();

        String secondBody = secondResult.getResponse().getContentAsString();
        assertThat(secondBody).isEqualTo(firstBody);
    }

    @Test
    @DisplayName("Hala işlenmekte olan (PROCESSING) anahtar geldiğinde HTTP 409 Conflict dönmelidir")
    void testConcurrentProcessingReturns409Conflict() throws Exception {
        String inFlightKey = UUID.randomUUID().toString();

        // Kilit alınmış gibi simüle et
        idempotencyStorage.lock(inFlightKey, 60);

        AiSummaryRequestDto requestDto = AiSummaryRequestDto.builder()
                .title("Eşzamanlı İstek")
                .text("Aynı anda gelen istekler çakışmaya yol açmamalıdır.")
                .build();

        mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .header(IdempotencyFilter.IDEMPOTENCY_HEADER, inFlightKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isConflict())
                .andExpect(header().string(IdempotencyFilter.STATUS_HEADER, "CONFLICT"));
    }

    @Test
    @DisplayName("X-Idempotency-Key başlığı gönderilmediğinde istek normal yürütülmeli ve header dönmemelidir")
    void testNormalRequestWithoutIdempotencyKey() throws Exception {
        AiSummaryRequestDto requestDto = AiSummaryRequestDto.builder()
                .title("Standart İstek")
                .text("Başlıksız istek normal akışta çalışır.")
                .build();

        mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(header().doesNotExist(IdempotencyFilter.STATUS_HEADER));
    }
}
