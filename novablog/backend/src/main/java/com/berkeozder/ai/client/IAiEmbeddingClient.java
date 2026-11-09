package com.berkeozder.ai.client;

/**
 * Metinleri çok boyutlu sayısal vektörlere (Vector Embedding) dönüştüren istemci arayüzü.
 *
 * @author Berke Özder
 */
public interface IAiEmbeddingClient {

    /**
     * Verilen metin için L2-normalize edilmiş embedding vektörü üretir.
     */
    float[] generateEmbedding(String text);

    /**
     * Vektör boyutunu döner (Örn: 128, 384, 1536).
     */
    int getDimension();

    /**
     * Sağlayıcı adını döner.
     */
    String getProviderName();
}

