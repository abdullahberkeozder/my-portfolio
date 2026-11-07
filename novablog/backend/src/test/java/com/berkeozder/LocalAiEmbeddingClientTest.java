package com.berkeozder;

import com.berkeozder.ai.client.impl.LocalAiEmbeddingClientImpl;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.vector.VectorUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LocalAiEmbeddingClient Unit Tests (Semantic Similarity & Vector Dimensions)")
class LocalAiEmbeddingClientTest {

    private LocalAiEmbeddingClientImpl embeddingClient;

    @BeforeEach
    void setUp() {
        AiProperties properties = new AiProperties();
        properties.setEmbeddingDimension(128);
        embeddingClient = new LocalAiEmbeddingClientImpl(properties);
    }

    @Test
    @DisplayName("Should generate embedding of configured dimension")
    void generateEmbedding_shouldHaveCorrectDimension() {
        float[] vector = embeddingClient.generateEmbedding("Spring Boot REST API Java");
        assertNotNull(vector);
        assertEquals(128, vector.length);

        // Should be normalized (norm ~ 1.0)
        double norm = 0.0;
        for (float val : vector) {
            norm += val * val;
        }
        assertEquals(1.0, Math.sqrt(norm), 0.01);
    }

    @Test
    @DisplayName("Semantically related texts should have significantly higher similarity than unrelated texts")
    void semanticSimilarity_relatedTextsShouldScoreHigher() {
        String textA = "Spring Boot REST API mimarisi ve mikroservis geliştirme";
        String textB = "Java backend servisleri, API controller ve yazılım mimarisi";
        String unrelated = "Akdeniz sahillerinde yaz tatili ve otel rezervasyonları";

        float[] vecA = embeddingClient.generateEmbedding(textA);
        float[] vecB = embeddingClient.generateEmbedding(textB);
        float[] vecUnrelated = embeddingClient.generateEmbedding(unrelated);

        double similarityAB = VectorUtils.cosineSimilarity(vecA, vecB);
        double similarityAUnrelated = VectorUtils.cosineSimilarity(vecA, vecUnrelated);

        assertTrue(similarityAB > similarityAUnrelated,
                String.format("İlgili metinler (%.4f) alakasız metinlerden (%.4f) daha yüksek skora sahip olmalıdır.",
                        similarityAB, similarityAUnrelated));
        assertTrue(similarityAB > 0.40, "İlgili teknik metinlerin kosinüs benzerliği 0.40'tan büyük olmalıdır.");
    }

    @Test
    @DisplayName("Empty or blank text should return zero vector safely")
    void emptyText_shouldReturnZeroVector() {
        float[] vector = embeddingClient.generateEmbedding("");
        assertNotNull(vector);
        assertEquals(128, vector.length);
        for (float val : vector) {
            assertEquals(0.0f, val);
        }
    }
}
