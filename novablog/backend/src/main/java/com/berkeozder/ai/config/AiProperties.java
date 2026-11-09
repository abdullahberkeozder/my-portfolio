package com.berkeozder.ai.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Spring AI, Vektör Arama ve LLM Entegrasyonu Yapılandırma Özellikleri.
 *
 * @author Berke Özder
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    /**
     * AI özelliklerinin aktif olup olmadığı.
     */
    private boolean enabled = true;

    /**
     * AI sağlayıcısı: LOCAL (dahili deterministik nlp & vektör motoru), OPENAI, OLLAMA.
     */
    private String provider = "LOCAL";

    /**
     * Harici model API anahtarı (OpenAI vb. için).
     */
    private String apiKey = "";

    /**
     * AI REST API temel URL'i.
     */
    private String baseUrl = "https://api.openai.com/v1";

    /**
     * Chat ve özetleme modeli.
     */
    private String chatModel = "gpt-4o-mini";

    /**
     * Vektör gömme (Embedding) modeli.
     */
    private String embeddingModel = "text-embedding-3-small";

    /**
     * Gömme vektörü boyut sayısı (Varsayılan: 128 boyutlu yerel normalize vektör).
     */
    private int embeddingDimension = 128;

    /**
     * Anlamsal benzerlik eşik değeri (0.0 - 1.0 arası kosinüs benzerliği).
     */
    private double similarityThreshold = 0.55;

    /**
     * Yorum ve içerik toksisite eşik değeri (Bu skorun üzerindeki içerikler otomatik onaylanmaz).
     */
    private double toxicityThreshold = 0.65;
}

