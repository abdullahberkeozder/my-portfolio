package com.berkeozder;

import com.berkeozder.ai.vector.VectorUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("VectorUtils Unit Tests (Cosine Similarity & Normalization)")
class VectorUtilsTest {

    @Test
    @DisplayName("Identical vectors should have cosine similarity of 1.0")
    void identicalVectors_shouldHaveCosineSimilarityOne() {
        float[] v1 = new float[]{1.0f, 2.0f, 3.0f};
        float[] v2 = new float[]{1.0f, 2.0f, 3.0f};

        double similarity = VectorUtils.cosineSimilarity(v1, v2);
        assertEquals(1.0, similarity, 0.0001);
    }

    @Test
    @DisplayName("Orthogonal vectors should have cosine similarity of 0.0")
    void orthogonalVectors_shouldHaveCosineSimilarityZero() {
        float[] v1 = new float[]{1.0f, 0.0f, 0.0f};
        float[] v2 = new float[]{0.0f, 1.0f, 0.0f};

        double similarity = VectorUtils.cosineSimilarity(v1, v2);
        assertEquals(0.0, similarity, 0.0001);
    }

    @Test
    @DisplayName("Opposite vectors should have cosine similarity of -1.0")
    void oppositeVectors_shouldHaveCosineSimilarityMinusOne() {
        float[] v1 = new float[]{1.0f, 0.0f};
        float[] v2 = new float[]{-1.0f, 0.0f};

        double similarity = VectorUtils.cosineSimilarity(v1, v2);
        assertEquals(-1.0, similarity, 0.0001);
    }

    @Test
    @DisplayName("Zero or null vectors should return 0.0 safely without division by zero")
    void zeroOrNullVectors_shouldReturnZero() {
        float[] zero = new float[]{0.0f, 0.0f, 0.0f};
        float[] normal = new float[]{1.0f, 2.0f, 3.0f};

        assertEquals(0.0, VectorUtils.cosineSimilarity(zero, normal));
        assertEquals(0.0, VectorUtils.cosineSimilarity(null, normal));
        assertEquals(0.0, VectorUtils.cosineSimilarity(normal, null));
    }

    @Test
    @DisplayName("L2 Normalization should produce unit vectors with Euclidean norm of 1.0")
    void l2Normalize_shouldProduceUnitLength() {
        float[] v = new float[]{3.0f, 4.0f}; // 3^2 + 4^2 = 25, sqrt = 5 -> [0.6, 0.8]
        float[] normalized = VectorUtils.l2Normalize(v);

        assertEquals(0.6f, normalized[0], 0.001f);
        assertEquals(0.8f, normalized[1], 0.001f);

        double norm = Math.sqrt(normalized[0] * normalized[0] + normalized[1] * normalized[1]);
        assertEquals(1.0, norm, 0.0001);
    }

    @Test
    @DisplayName("Serialization and deserialization should preserve float values")
    void serialization_shouldBeReversible() {
        float[] original = new float[]{0.123f, -0.456f, 0.789f};
        String json = VectorUtils.serialize(original);

        assertNotNull(json);
        assertTrue(json.startsWith("[") && json.endsWith("]"));

        float[] restored = VectorUtils.deserialize(json);
        assertEquals(original.length, restored.length);
        for (int i = 0; i < original.length; i++) {
            assertEquals(original[i], restored[i], 0.0001f);
        }
    }

    @Test
    @DisplayName("Euclidean distance should correctly compute distance between points")
    void euclideanDistance_shouldComputeCorrectDistance() {
        float[] p1 = new float[]{0.0f, 0.0f};
        float[] p2 = new float[]{3.0f, 4.0f};

        double distance = VectorUtils.euclideanDistance(p1, p2);
        assertEquals(5.0, distance, 0.0001);
    }
}

