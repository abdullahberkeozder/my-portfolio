package com.berkeozder.ai.client.impl;

import com.berkeozder.ai.client.IAiChatClient;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.dto.AiModerationResponseDto;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Deterministik, NLP tabanlı yerel Chat, Özetleme, Etiketleme ve Moderasyon motoru.
 * Dış ağ bağımlılığı ve API anahtarı gerektirmeden tam işlevsellik sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class LocalAiChatClientImpl implements IAiChatClient {

    private final AiProperties aiProperties;

    private static final Set<String> STOP_WORDS = Set.of(
            "bir", "bu", "ve", "veya", "ile", "için", "de", "da", "ki", "en", "çok", "daha",
            "gibi", "kadar", "her", "ama", "fakat", "ancak", "ise", "olarak", "olan", "ne",
            "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "is",
            "are", "was", "were", "by", "from", "it", "that", "this", "be", "as"
    );

    private static final Set<String> TOXIC_WORDS = Set.of(
            "küfür", "aptal", "salak", "gerizekalı", "sahtekar", "dolandırıcı", "hırsız",
            "rezalet", "pislik", "lanet", "nefret", "tehdit", "spam", "scam", "hack", "kumar",
            "bahis", "viagra", "porn", "bitch", "idiot", "stupid", "hate", "scammer", "fraud"
    );

    private static final Set<String> POSITIVE_WORDS = Set.of(
            "harika", "mükemmel", "başarılı", "teşekkür", "faydalı", "güzel", "tebrik", "süper",
            "öğretici", "kaliteli", "harikulade", "awesome", "great", "excellent", "thanks", "helpful", "good", "best"
    );

    private static final Set<String> NEGATIVE_WORDS = Set.of(
            "berbat", "kötü", "rezil", "çöp", "bozuk", "yetersiz", "zaman kaybı", "yanlış",
            "anlamsız", "terrible", "bad", "awful", "useless", "broken", "worst", "waste"
    );

    private static final Pattern SENTENCE_SPLIT_PATTERN = Pattern.compile("(?<=[.!?\\n])\\s+");

    @Override
    public AiSummaryResponseDto generateSummary(String title, String content) {
        String fullText = (content != null ? content : "").trim();
        if (fullText.isEmpty()) {
            return AiSummaryResponseDto.builder()
                    .summary("İçerik boş olduğu için özet oluşturulamadı.")
                    .originalCharacterCount(0)
                    .summaryCharacterCount(0)
                    .compressionRatePercent(0.0)
                    .provider(getProviderName())
                    .model("extractive-salience-v1")
                    .build();
        }

        // Cümlelere ayırma
        String[] rawSentences = SENTENCE_SPLIT_PATTERN.split(fullText);
        List<String> validSentences = Arrays.stream(rawSentences)
                .map(String::trim)
                .filter(s -> s.length() >= 15)
                .toList();

        String summary;
        if (validSentences.isEmpty()) {
            summary = fullText.length() > 200 ? fullText.substring(0, 197) + "..." : fullText;
        } else if (validSentences.size() <= 2) {
            summary = String.join(" ", validSentences);
        } else {
            // Cümle önem skoru hesaplama (Salience Scoring)
            Set<String> titleTokens = extractCleanTokens(title != null ? title : "");
            Map<Integer, Double> scoredSentences = new LinkedHashMap<>();

            for (int i = 0; i < validSentences.size(); i++) {
                String sentence = validSentences.get(i);
                double score = 0.0;

                // Konum ağırlığı (Lead bias: ilk cümleler genel tezi belirtir)
                if (i == 0) score += 3.5;
                else if (i == 1) score += 2.0;
                else if (i == validSentences.size() - 1) score += 1.5;

                // Başlık anahtar kelime eşleşmesi
                Set<String> sentenceTokens = extractCleanTokens(sentence);
                long titleOverlap = sentenceTokens.stream().filter(titleTokens::contains).count();
                score += (titleOverlap * 1.8);

                // Cümle uzunluk dengesi (30 - 180 karakter en ideal özet cümleleridir)
                if (sentence.length() >= 35 && sentence.length() <= 180) {
                    score += 1.2;
                }

                scoredSentences.put(i, score);
            }

            // En yüksek skorlu 2 veya 3 cümleyi orijinal akış sırasına göre seç
            List<Integer> bestIndices = scoredSentences.entrySet().stream()
                    .sorted(Map.Entry.<Integer, Double>comparingByValue().reversed())
                    .limit(2)
                    .map(Map.Entry::getKey)
                    .sorted()
                    .toList();

            summary = bestIndices.stream()
                    .map(validSentences::get)
                    .collect(Collectors.joining(" "));
        }

        int origLen = fullText.length();
        int sumLen = summary.length();
        double compressionRate = origLen > 0 ? Math.max(0.0, ((origLen - sumLen) / (double) origLen) * 100.0) : 0.0;

        return AiSummaryResponseDto.builder()
                .summary(summary)
                .originalCharacterCount(origLen)
                .summaryCharacterCount(sumLen)
                .compressionRatePercent(Math.round(compressionRate * 100.0) / 100.0)
                .provider(getProviderName())
                .model("extractive-salience-v1")
                .build();
    }

    @Override
    public AiTagSuggestionResponseDto suggestTagsAndCategory(String title, String content, Map<Long, String> availableCategories) {
        String combined = (title != null ? title : "") + " " + (content != null ? content : "");
        Set<String> tokens = extractCleanTokens(combined);

        // Terim frekansları
        Map<String, Integer> freqMap = new HashMap<>();
        for (String t : tokens) {
            if (t.length() >= 3 && !STOP_WORDS.contains(t)) {
                freqMap.merge(t, 1, Integer::sum);
            }
        }

        // En sık geçen ve teknik/anlamsal değeri yüksek ilk 4 etiket
        List<String> suggestedTags = freqMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(4)
                .map(Map.Entry::getKey)
                .map(s -> Character.toUpperCase(s.charAt(0)) + s.substring(1))
                .toList();

        if (suggestedTags.isEmpty()) {
            suggestedTags = List.of("Genel", "Yazılım", "Teknoloji");
        }

        // Kategori Eşleme
        Long bestCategoryId = null;
        String bestCategoryName = null;
        double highestCategoryScore = 0.0;

        if (availableCategories != null && !availableCategories.isEmpty()) {
            for (Map.Entry<Long, String> entry : availableCategories.entrySet()) {
                String catName = entry.getValue().toLowerCase(Locale.ROOT);
                double catScore = 0.0;
                for (String t : tokens) {
                    if (catName.contains(t) || t.contains(catName)) {
                        catScore += 2.0;
                    }
                }
                if (catScore > highestCategoryScore) {
                    highestCategoryScore = catScore;
                    bestCategoryId = entry.getKey();
                    bestCategoryName = entry.getValue();
                }
            }
            if (bestCategoryName == null) {
                // En azından ilk kategoriyi varsayılan seç
                Map.Entry<Long, String> first = availableCategories.entrySet().iterator().next();
                bestCategoryId = first.getKey();
                bestCategoryName = first.getValue();
            }
        }

        double confidence = Math.min(0.98, Math.max(0.60, (highestCategoryScore / 5.0) + 0.5));

        return AiTagSuggestionResponseDto.builder()
                .suggestedTags(suggestedTags)
                .suggestedCategoryId(bestCategoryId)
                .suggestedCategoryName(bestCategoryName)
                .confidenceScore(Math.round(confidence * 100.0) / 100.0)
                .provider(getProviderName())
                .build();
    }

    @Override
    public AiModerationResponseDto moderateContent(String text) {
        if (text == null || text.isBlank()) {
            return AiModerationResponseDto.builder()
                    .flagged(false)
                    .toxicityScore(0.0)
                    .sentiment("NEUTRAL")
                    .sentimentScore(0.0)
                    .reason("Boş içerik.")
                    .provider(getProviderName())
                    .build();
        }

        String lower = text.toLowerCase(Locale.ROOT);
        Set<String> cleanTokens = extractCleanTokens(lower);

        List<String> detectedToxicWords = new ArrayList<>();
        for (String toxic : TOXIC_WORDS) {
            if (lower.contains(toxic)) {
                detectedToxicWords.add(toxic);
            }
        }

        double toxicityScore = 0.0;
        if (!detectedToxicWords.isEmpty()) {
            toxicityScore = Math.min(1.0, 0.40 + (detectedToxicWords.size() * 0.30));
        }

        // Duygu Durum (Sentiment) Analizi
        long positiveCount = cleanTokens.stream().filter(POSITIVE_WORDS::contains).count();
        long negativeCount = cleanTokens.stream().filter(NEGATIVE_WORDS::contains).count();

        String sentiment;
        double sentimentScore;
        if (positiveCount > negativeCount) {
            sentiment = "POSITIVE";
            sentimentScore = Math.min(1.0, (positiveCount - negativeCount) * 0.35);
        } else if (negativeCount > positiveCount || toxicityScore > 0.4) {
            sentiment = "NEGATIVE";
            sentimentScore = -Math.min(1.0, (negativeCount + detectedToxicWords.size()) * 0.35);
        } else {
            sentiment = "NEUTRAL";
            sentimentScore = 0.0;
        }

        boolean flagged = toxicityScore >= aiProperties.getToxicityThreshold();
        String reason = flagged
                ? "İçerikte sakıncalı ifadeler tespit edildi: " + String.join(", ", detectedToxicWords)
                : "İçerik kurallara uygundur.";

        return AiModerationResponseDto.builder()
                .flagged(flagged)
                .toxicityScore(Math.round(toxicityScore * 100.0) / 100.0)
                .sentiment(sentiment)
                .sentimentScore(Math.round(sentimentScore * 100.0) / 100.0)
                .flaggedCategories(detectedToxicWords)
                .reason(reason)
                .provider(getProviderName())
                .build();
    }

    @Override
    public String getProviderName() {
        return "LOCAL-AI-ENGINE";
    }

    private Set<String> extractCleanTokens(String text) {
        if (text == null || text.isBlank()) return Collections.emptySet();
        return Arrays.stream(text.toLowerCase(Locale.ROOT).replaceAll("[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ\\s]", " ").split("\\s+"))
                .map(String::trim)
                .filter(t -> t.length() >= 2)
                .collect(Collectors.toSet());
    }
}
