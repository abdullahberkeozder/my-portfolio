package com.berkeozder;

import com.berkeozder.ai.client.impl.OpenAiChatAndEmbeddingClientImpl;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Resilience4j Circuit Breaker, Retry ve Actuator Entegrasyon Testleri.
 *
 * @author Berke Özder
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ResilienceCircuitBreakerIntegrationTest {

    @Autowired
    private CircuitBreakerRegistry circuitBreakerRegistry;

    @Autowired
    private OpenAiChatAndEmbeddingClientImpl openAiClient;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Resilience4j CircuitBreakerRegistry aiService instance'ını doğru yapılandırmayla yüklemelidir")
    void testCircuitBreakerRegistryContainsAiService() {
        assertThat(circuitBreakerRegistry).isNotNull();

        CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker("aiService");
        assertThat(cb).isNotNull();
        assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.CLOSED);
        assertThat(cb.getName()).isEqualTo("aiService");
    }

    @Test
    @DisplayName("CircuitBreaker devredeyken harici hata durumunda yerel fallback sorunsuz çalışmalıdır")
    void testAiServiceFallbackExecution() {
        // Fallback doğrudan çağrıldığında veya hata durumunda yerel NLP özetini döndürmelidir
        AiSummaryResponseDto fallback = openAiClient.fallbackGenerateSummary(
                "Mikroservis Mimarisi",
                "Mikroservisler bağımsız dağıtılabilir servislerden oluşur.",
                new RuntimeException("Simüle edilmiş OpenAI 503 Hatası")
        );

        assertThat(fallback).isNotNull();
        assertThat(fallback.getSummary()).isNotEmpty();
        assertThat(fallback.getProvider()).contains("LOCAL");
    }

    @Test
    @DisplayName("Actuator /actuator/circuitbreakers endpoint'i kayıtlı devre kesicileri listelemelidir")
    void testActuatorCircuitBreakersEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/circuitbreakers")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.circuitBreakers").isMap())
                .andExpect(jsonPath("$.circuitBreakers.aiService").exists());
    }
}
