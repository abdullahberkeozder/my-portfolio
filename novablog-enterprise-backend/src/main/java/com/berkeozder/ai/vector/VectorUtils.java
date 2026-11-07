package com.berkeozder.ai.vector;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;

import java.util.Arrays;
import java.util.List;

/**
 * Çok boyutlu vektör matematiksel operasyonları ve serileştirme yardımcı sınıfı.
 * Kosinüs benzerliği, Öklid mesafesi ve L2 normalizasyonu sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
public final class VectorUtils {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private VectorUtils() {
        // Utility class
    }

    /**
     * İki vektör arasındaki Kosinüs Benzerliğini (Cosine Similarity) hesaplar.
     * Sonuç [-1.0, 1.0] aralığında döner (Pozitif normalizasyonda [0.0, 1.0]).
     */
    public static double cosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null) {
            return 0.0;
        }
        int minLength = Math.min(vectorA.length, vectorB.length);
        if (minLength == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < minLength; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA <= 0.0 || normB <= 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(-1.0, Math.min(1.0, similarity));
    }

    /**
     * İki vektör arasındaki Öklid Mesafesini (Euclidean Distance) hesaplar.
     */
    public static double euclideanDistance(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null) {
            return Double.MAX_VALUE;
        }
        int minLength = Math.min(vectorA.length, vectorB.length);
        double sum = 0.0;
        for (int i = 0; i < minLength; i++) {
            double diff = vectorA[i] - vectorB[i];
            sum += diff * diff;
        }
        return Math.sqrt(sum);
    }

    /**
     * Vektörü birim uzunluğa (Unit Vector - L2 Normalization) getirir.
     */
    public static float[] l2Normalize(float[] vector) {
        if (vector == null || vector.length == 0) {
            return new float[0];
        }
        double sumSquares = 0.0;
        for (float val : vector) {
            sumSquares += val * val;
        }
        double norm = Math.sqrt(sumSquares);
        if (norm <= 0.0) {
            return Arrays.copyOf(vector, vector.length);
        }

        float[] normalized = new float[vector.length];
        for (int i = 0; i < vector.length; i++) {
            normalized[i] = (float) (vector[i] / norm);
        }
        return normalized;
    }

    /**
     * float[] dizisini veritabanında TEXT olarak saklanabilen JSON dizesine dönüştürür.
     */
    public static String serialize(float[] vector) {
        if (vector == null || vector.length == 0) {
            return "[]";
        }
        try {
            return OBJECT_MAPPER.writeValueAsString(vector);
        } catch (Exception e) {
            log.error("Vektör serileştirme hatası: {}", e.getMessage());
            return "[]";
        }
    }

    /**
     * Veritabanından okunan JSON formatındaki vektör dizesini float[] dizisine dönüştürür.
     */
    public static float[] deserialize(String json) {
        if (json == null || json.isBlank() || "[]".equals(json.trim())) {
            return new float[0];
        }
        try {
            List<Double> list = OBJECT_MAPPER.readValue(json, new TypeReference<List<Double>>() {});
            float[] vector = new float[list.size()];
            for (int i = 0; i < list.size(); i++) {
                vector[i] = list.get(i).floatValue();
            }
            return vector;
        } catch (Exception e) {
            log.error("Vektör deserileştirme hatası (json: {}): {}", json, e.getMessage());
            return new float[0];
        }
    }
}
