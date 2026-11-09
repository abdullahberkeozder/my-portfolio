package com.berkeozder.ai.service;

import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import com.berkeozder.ai.dto.BlogSemanticSearchResultDto;
import com.berkeozder.business.dto.BlogDto;

import java.util.List;

/**
 * Spring AI & Vektör Arama İş Mantığı Servis Arayüzü.
 *
 * @author Berke Özder
 */
public interface IAiBlogService {

    /**
     * Belirtilen blog ID'si için AI özeti üretir ve veri tabanına kaydeder.
     */
    BlogDto generateAndSaveBlogSummary(Long blogId);

    /**
     * Herhangi bir ham metin için anlık AI özeti üretir.
     */
    AiSummaryResponseDto summarizeText(String text, String title);

    /**
     * Blog başlık ve içeriğine göre akıllı etiket ve kategori önerilerinde bulunur.
     */
    AiTagSuggestionResponseDto suggestTagsAndCategory(String title, String content);

    /**
     * Doğal dil sorgusuyla Kosinüs Benzerliği (Cosine Similarity) kullanarak anlamsal vektör araması yapar.
     */
    List<BlogSemanticSearchResultDto> searchSemantic(String query, Double threshold, Integer limit);

    /**
     * Geleneksel kelime eşleşmesi ile vektör benzerliğini birleştiren Hibrit Arama (RRF / Weighted Fusion) yapar.
     */
    List<BlogSemanticSearchResultDto> searchHybrid(String query, Double threshold, Integer limit);

    /**
     * Mevcut tüm blogların vektör gömmelerini (embedding) yeniden hesaplar ve kaydeder.
     */
    int reindexAllBlogEmbeddings();

    /**
     * Tek bir blog için embedding oluşturup kaydeder.
     */
    void indexBlogEmbedding(Long blogId);
}

