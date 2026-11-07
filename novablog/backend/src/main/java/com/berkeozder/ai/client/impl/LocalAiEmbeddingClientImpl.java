package com.berkeozder.ai.client.impl;

import com.berkeozder.ai.client.IAiEmbeddingClient;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.vector.VectorUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * Deterministik, çok boyutlu yoğun vektör (Dense Vector Embedding) üreten yerel motor.
 * Metinleri anlamsal kümeleme (Semantic Clustering) ve n-gram hashing ile L2-normalize vektörlere dönüştürür.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class LocalAiEmbeddingClientImpl implements IAiEmbeddingClient {

    private final AiProperties aiProperties;

    // Anlamsal kavram kümeleri (Semantic Concept Clusters)
    private static final Map<String, Integer> CONCEPT_CLUSTERS = new HashMap<>();

    static {
        // Backend & Java & Mimari (Cluster 0-15)
        registerCluster(new String[]{"java", "spring", "backend", "api", "rest", "controller", "service", "mimari", "architecture", "microservice", "oop"}, 0);
        // Veritabanı & Cache (Cluster 16-31)
        registerCluster(new String[]{"database", "veritabani", "sql", "postgres", "postgresql", "redis", "cache", "onbellek", "jpa", "hibernate", "flyway", "index"}, 16);
        // Güvenlik & Yetkilendirme (Cluster 32-47)
        registerCluster(new String[]{"security", "guvenlik", "auth", "jwt", "token", "oauth", "oauth2", "2fa", "mfa", "totp", "password", "sifre", "role", "yetki"}, 32);
        // DevOps, Bulut & Dağıtım (Cluster 48-63)
        registerCluster(new String[]{"docker", "container", "compose", "kubernetes", "cloud", "bulut", "minio", "s3", "storage", "devops", "ci", "cd"}, 48);
        // Batch, Veri İşleme & Analitik (Cluster 64-79)
        registerCluster(new String[]{"batch", "etl", "job", "scheduler", "zamanlayici", "analitik", "analytics", "rapor", "report", "export", "istatistik"}, 64);
        // İletişim, WebSocket & Event (Cluster 80-95)
        registerCluster(new String[]{"websocket", "stomp", "sockjs", "canli", "stream", "notification", "bildirim", "event", "mesaj", "message"}, 80);
        // Frontend & UI (Cluster 96-111)
        registerCluster(new String[]{"frontend", "react", "next", "nextjs", "javascript", "typescript", "ui", "ux", "tasarim", "css", "html"}, 96);
        // Test & Kalite (Cluster 112-127)
        registerCluster(new String[]{"test", "junit", "mock", "mockito", "integration", "assert", "coverage", "jacoco", "kalite", "quality"}, 112);
    }

    private static void registerCluster(String[] words, int baseIndex) {
        for (String word : words) {
            CONCEPT_CLUSTERS.put(word.toLowerCase(Locale.ROOT), baseIndex);
        }
    }

    @Override
    public float[] generateEmbedding(String text) {
        int dim = getDimension();
        float[] vector = new float[dim];
        if (text == null || text.isBlank()) {
            return vector;
        }

        String normalizedText = text.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\\s]", " ");

        String[] tokens = normalizedText.split("\\s+");
        if (tokens.length == 0) {
            return vector;
        }

        Map<String, Integer> termFrequencies = new HashMap<>();
        for (String token : tokens) {
            if (token.length() >= 2) {
                termFrequencies.merge(token, 1, Integer::sum);
            }
        }

        // 1. Doğrudan Anlamsal Kümeleme Ağırlıkları
        for (Map.Entry<String, Integer> entry : termFrequencies.entrySet()) {
            String term = entry.getKey();
            int freq = entry.getValue();
            double weight = Math.log(1.0 + freq);

            Integer clusterBase = CONCEPT_CLUSTERS.get(term);
            if (clusterBase != null) {
                for (int offset = 0; offset < 16 && (clusterBase + offset) < dim; offset++) {
                    vector[clusterBase + offset] += (float) (weight * (1.0 / (1.0 + (offset % 4))));
                }
            }

            // 2. Hash-based Feature Projection (N-Gram Hashing)
            int hash = hashTerm(term);
            int index = Math.abs(hash) % dim;
            float sign = (hash & 1) == 0 ? 1.0f : -1.0f;
            vector[index] += (float) (sign * weight);

            // Karakter trigram projeksiyonu (yazım hatalarına ve eklemelere karşı tolerans)
            if (term.length() >= 3) {
                for (int i = 0; i <= term.length() - 3; i++) {
                    String trigram = term.substring(i, i + 3);
                    int triHash = hashTerm(trigram);
                    int triIndex = Math.abs(triHash) % dim;
                    vector[triIndex] += (float) (0.35 * weight);
                }
            }
        }

        return VectorUtils.l2Normalize(vector);
    }

    @Override
    public int getDimension() {
        return Math.max(16, aiProperties.getEmbeddingDimension());
    }

    @Override
    public String getProviderName() {
        return "LOCAL-EMBEDDING-ENGINE";
    }

    private int hashTerm(String term) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(term.getBytes(StandardCharsets.UTF_8));
            return ((digest[0] & 0xFF) << 24) |
                    ((digest[1] & 0xFF) << 16) |
                    ((digest[2] & 0xFF) << 8) |
                    (digest[3] & 0xFF);
        } catch (Exception e) {
            return term.hashCode();
        }
    }
}
