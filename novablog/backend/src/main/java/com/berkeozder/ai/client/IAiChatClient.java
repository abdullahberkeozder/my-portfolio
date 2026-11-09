package com.berkeozder.ai.client;

import com.berkeozder.ai.dto.AiModerationResponseDto;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;

import java.util.List;
import java.util.Map;

/**
 * LLM (Large Language Model) metin tamamlama, özetleme, etiketleme ve denetleme arayüzü.
 *
 * @author Berke Özder
 */
public interface IAiChatClient {

    /**
     * Metin veya blog içeriği için 2-3 cümlelik yönetici özeti (TL;DR) oluşturur.
     */
    AiSummaryResponseDto generateSummary(String title, String content);

    /**
     * İçeriği analiz ederek en uygun etiketleri ve kategoriyi önerir.
     */
    AiTagSuggestionResponseDto suggestTagsAndCategory(String title, String content, Map<Long, String> availableCategories);

    /**
     * Yorum veya metin içeriğini toksisite, nefret söylemi ve duygu durumu açısından denetler.
     */
    AiModerationResponseDto moderateContent(String text);

    /**
     * Sağlayıcı adını döner.
     */
    String getProviderName();
}

