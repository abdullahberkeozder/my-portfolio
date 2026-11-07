package com.berkeozder.ai.client.impl;

import com.berkeozder.ai.client.IAiChatClient;
import com.berkeozder.ai.client.IAiEmbeddingClient;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.dto.AiModerationResponseDto;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.annotation.Primary;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Hibrit AI İstemcisi. Yapılandırmaya göre OpenAI REST API veya Yerel AI Motoru arasında
 * dinamik yönlendirme yapar. Harici API hatasında otomatik olarak yerel motora geri düşer (Fallback).
 *
 * @author Berke Özder
 */
@Log4j2
@Primary
@Component
public class OpenAiChatAndEmbeddingClientImpl implements IAiChatClient, IAiEmbeddingClient {

    private final AiProperties aiProperties;
    private final LocalAiChatClientImpl localChatClient;
    private final LocalAiEmbeddingClientImpl localEmbeddingClient;
    private final RestTemplate restTemplate;

    public OpenAiChatAndEmbeddingClientImpl(AiProperties aiProperties,
                                            LocalAiChatClientImpl localChatClient,
                                            LocalAiEmbeddingClientImpl localEmbeddingClient) {
        this.aiProperties = aiProperties;
        this.localChatClient = localChatClient;
        this.localEmbeddingClient = localEmbeddingClient;
        this.restTemplate = new RestTemplate();
    }

    private boolean isExternalOpenAiEnabled() {
        return "OPENAI".equalsIgnoreCase(aiProperties.getProvider())
                && aiProperties.getApiKey() != null
                && !aiProperties.getApiKey().isBlank();
    }

    @Override
    public AiSummaryResponseDto generateSummary(String title, String content) {
        if (!isExternalOpenAiEnabled()) {
            return localChatClient.generateSummary(title, content);
        }

        try {
            log.info("OpenAI API ile özet oluşturuluyor (Model: {})...", aiProperties.getChatModel());
            String prompt = String.format(
                    "Aşağıdaki blog yazısı için 2-3 cümlelik net, profesyonel bir yönetici özeti (TL;DR) oluştur:\nBaşlık: %s\nİçerik: %s",
                    title, content
            );

            Map<String, Object> body = Map.of(
                    "model", aiProperties.getChatModel(),
                    "messages", List.of(
                            Map.of("role", "system", "content", "Sen profesyonel bir teknik blog editörüsün."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "max_tokens", 250,
                    "temperature", 0.3
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiProperties.getApiKey());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(aiProperties.getBaseUrl() + "/chat/completions", request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List choices = (List) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    String summary = (String) message.get("content");

                    int origLen = (content != null ? content.length() : 0);
                    int sumLen = summary.length();
                    double compRatio = origLen > 0 ? ((origLen - sumLen) / (double) origLen) * 100.0 : 0.0;

                    return AiSummaryResponseDto.builder()
                            .summary(summary.trim())
                            .originalCharacterCount(origLen)
                            .summaryCharacterCount(sumLen)
                            .compressionRatePercent(Math.round(compRatio * 100.0) / 100.0)
                            .provider("OPENAI")
                            .model(aiProperties.getChatModel())
                            .build();
                }
            }
        } catch (Exception e) {
            log.warn("OpenAI API çağrısı başarısız oldu, yerel NLP motoruna geri düşülüyor. Hata: {}", e.getMessage());
        }

        return localChatClient.generateSummary(title, content);
    }

    @Override
    public AiTagSuggestionResponseDto suggestTagsAndCategory(String title, String content, Map<Long, String> availableCategories) {
        // Yerel zeki çıkarım hızlı ve güvenilirdir; OpenAI gerektiğinde entegre edilebilir
        return localChatClient.suggestTagsAndCategory(title, content, availableCategories);
    }

    @Override
    public AiModerationResponseDto moderateContent(String text) {
        return localChatClient.moderateContent(text);
    }

    @Override
    public float[] generateEmbedding(String text) {
        if (!isExternalOpenAiEnabled()) {
            return localEmbeddingClient.generateEmbedding(text);
        }

        try {
            Map<String, Object> body = Map.of(
                    "model", aiProperties.getEmbeddingModel(),
                    "input", text
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiProperties.getApiKey());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(aiProperties.getBaseUrl() + "/embeddings", request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List data = (List) response.getBody().get("data");
                if (data != null && !data.isEmpty()) {
                    Map first = (Map) data.get(0);
                    List<Double> embedding = (List<Double>) first.get("embedding");
                    float[] vector = new float[embedding.size()];
                    for (int i = 0; i < embedding.size(); i++) {
                        vector[i] = embedding.get(i).floatValue();
                    }
                    return vector;
                }
            }
        } catch (Exception e) {
            log.warn("OpenAI Embedding API çağrısı başarısız oldu, yerel motora geri düşülüyor: {}", e.getMessage());
        }

        return localEmbeddingClient.generateEmbedding(text);
    }

    @Override
    public int getDimension() {
        return isExternalOpenAiEnabled() ? 1536 : localEmbeddingClient.getDimension();
    }

    @Override
    public String getProviderName() {
        return isExternalOpenAiEnabled() ? "OPENAI-HYBRID" : localChatClient.getProviderName();
    }
}
