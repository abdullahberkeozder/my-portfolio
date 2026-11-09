package com.berkeozder;

import com.berkeozder.ai.client.impl.LocalAiChatClientImpl;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.dto.AiModerationResponseDto;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LocalAiChatClient Unit Tests (Summarization, Auto-Tagging & Content Moderation)")
class LocalAiChatClientTest {

    private LocalAiChatClientImpl chatClient;

    @BeforeEach
    void setUp() {
        AiProperties properties = new AiProperties();
        properties.setToxicityThreshold(0.65);
        chatClient = new LocalAiChatClientImpl(properties);
    }

    @Test
    @DisplayName("Should generate concise executive summary with compression metrics")
    void generateSummary_shouldProduceValidSummary() {
        String title = "Spring Boot ile Mikroservis Mimarisi";
        String content = "Mikroservis mimarisi, büyük monolitik sistemleri bağımsız ve yönetilebilir servis parçalarına böler. " +
                "Her mikroservis kendi veri tabanına ve iş mantığına sahip olarak ölçeklenebilirliği maksimize eder. " +
                "Spring Boot ve Spring Cloud, servis keşfi ve konfigürasyon yönetimini kolaylaştıran modern araçlar sunar. " +
                "Bununla birlikte, ağ gecikmeleri ve dağıtık veri tutarlılığı gibi zorluklar dikkatli mimari tasarım gerektirir.";

        AiSummaryResponseDto response = chatClient.generateSummary(title, content);

        assertNotNull(response);
        assertNotNull(response.getSummary());
        assertFalse(response.getSummary().isBlank());
        assertTrue(response.getOriginalCharacterCount() > response.getSummaryCharacterCount());
        assertTrue(response.getCompressionRatePercent() > 0.0);
        assertEquals("LOCAL-AI-ENGINE", response.getProvider());
    }

    @Test
    @DisplayName("Should extract domain keywords as suggested tags and match category")
    void suggestTagsAndCategory_shouldReturnRelevantTagsAndCategory() {
        String title = "PostgreSQL ve Redis Performans İpuçları";
        String content = "Veritabanı indeksleme stratejileri sorgu sürelerini önemli ölçüde hızlandırır. " +
                "Redis önbellekleme katmanı ile sık okunan veriler RAM üzerinde tutularak veritabanı yükü azaltılır.";

        Map<Long, String> categories = Map.of(
                1L, "Yazılım & Mimari",
                2L, "Veritabanı & Cache",
                3L, "Mobil Geliştirme"
        );

        AiTagSuggestionResponseDto response = chatClient.suggestTagsAndCategory(title, content, categories);

        assertNotNull(response);
        assertNotNull(response.getSuggestedTags());
        assertFalse(response.getSuggestedTags().isEmpty());
        assertEquals("Veritabanı & Cache", response.getSuggestedCategoryName());
        assertEquals(2L, response.getSuggestedCategoryId());
        assertTrue(response.getConfidenceScore() >= 0.50);
    }

    @Test
    @DisplayName("Should detect toxic words and flag content")
    void moderateContent_toxicInput_shouldBeFlagged() {
        String toxicComment = "Bu ne biçim yazı ya tam bir rezalet, yazar tam bir aptal ve dolandırıcı!";

        AiModerationResponseDto response = chatClient.moderateContent(toxicComment);

        assertNotNull(response);
        assertTrue(response.isFlagged());
        assertTrue(response.getToxicityScore() >= 0.65);
        assertEquals("NEGATIVE", response.getSentiment());
        assertTrue(response.getFlaggedCategories().contains("rezalet"));
        assertTrue(response.getFlaggedCategories().contains("aptal"));
    }

    @Test
    @DisplayName("Should approve clean and positive comments")
    void moderateContent_positiveInput_shouldBeApproved() {
        String positiveComment = "Harika ve son derece öğretici bir makale olmuş, emeklerinize sağlık çok teşekkürler!";

        AiModerationResponseDto response = chatClient.moderateContent(positiveComment);

        assertNotNull(response);
        assertFalse(response.isFlagged());
        assertTrue(response.getToxicityScore() < 0.20);
        assertEquals("POSITIVE", response.getSentiment());
        assertTrue(response.getSentimentScore() > 0.0);
    }
}

