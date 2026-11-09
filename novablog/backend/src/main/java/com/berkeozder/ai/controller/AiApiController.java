package com.berkeozder.ai.controller;

import com.berkeozder.ai.dto.*;
import com.berkeozder.ai.service.IAiBlogService;
import com.berkeozder.ai.service.IAiModerationService;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Spring AI & Vektör Arama REST API Uç Noktaları.
 * Anlamsal Arama, Hibrit Arama, Otomatik Özetleme (TL;DR), Etiket Önerisi ve İçerik Moderasyonu sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Spring AI & Akıllı Arama", description = "Vektör Gömme (Embedding), Kosinüs Benzerliği, Hibrit Arama, TL;DR Özetleme ve AI Moderasyonu")
public class AiApiController {

    private final IAiBlogService aiBlogService;
    private final IAiModerationService aiModerationService;

    @Operation(summary = "Blog için AI Özeti Oluştur (TL;DR)", description = "Belirtilen blog yazısı için LLM tabanlı 2-3 cümlelik yönetici özeti çıkarır ve kaydeder.")
    @PostMapping("/summarize/{blogId}")
    public ResponseEntity<ApiResult<BlogDto>> summarizeBlog(@PathVariable Long blogId) {
        log.info("REST: Blog AI özet talebi alındı. Blog ID: {}", blogId);
        BlogDto result = aiBlogService.generateAndSaveBlogSummary(blogId);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Ham Metin için Anlık AI Özeti", description = "Gönderilen serbest metin için anlık TL;DR özeti ve sıkıştırma oranı üretir.")
    @PostMapping("/summarize-text")
    public ResponseEntity<ApiResult<AiSummaryResponseDto>> summarizeText(@Valid @RequestBody AiSummaryRequestDto request) {
        AiSummaryResponseDto result = aiBlogService.summarizeText(request.getText(), request.getTitle());
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Akıllı Etiket ve Kategori Önerisi (Auto-Tagging)", description = "Blog başlığı ve içeriğini analiz ederek en uygun 3-5 etiketi ve en yakın kategoriyi önerir.")
    @PostMapping("/suggest-tags")
    public ResponseEntity<ApiResult<AiTagSuggestionResponseDto>> suggestTags(@Valid @RequestBody AiTagSuggestionRequestDto request) {
        AiTagSuggestionResponseDto result = aiBlogService.suggestTagsAndCategory(request.getTitle(), request.getContent());
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "İçerik Moderasyonu & Duygu Durum (Sentiment) Analizi", description = "Yorum veya metinleri toksisite, nefret söylemi ve duygu durumu (Pozitif/Nötr/Negatif) açısından denetler.")
    @PostMapping("/moderate")
    public ResponseEntity<ApiResult<AiModerationResponseDto>> moderateContent(@Valid @RequestBody AiModerationRequestDto request) {
        AiModerationResponseDto result = aiModerationService.moderateComment(request.getText());
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Anlamsal Vektör Araması (Semantic Vector Search)", description = "Doğal dil sorgusunu çok boyutlu vektöre dönüştürerek Kosinüs Benzerliği ile en alakalı blogları listeler.")
    @GetMapping("/search/semantic")
    public ResponseEntity<ApiResult<List<BlogSemanticSearchResultDto>>> searchSemantic(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "threshold", required = false) Double threshold,
            @RequestParam(name = "limit", required = false, defaultValue = "10") Integer limit
    ) {
        log.info("REST: Anlamsal vektör araması. Sorgu: '{}', Eşik: {}, Limit: {}", query, threshold, limit);
        List<BlogSemanticSearchResultDto> results = aiBlogService.searchSemantic(query, threshold, limit);
        return ResponseEntity.ok(ApiResult.success(results));
    }

    @Operation(summary = "Hibrit Arama (Hybrid Search: Semantic + Keyword RRF)", description = "Klasik anahtar kelime eşleşmesi ile Kosinüs benzerliği vektör skorunu füzyonla birleştirerek en iyi sıralamayı sunar.")
    @GetMapping("/search/hybrid")
    public ResponseEntity<ApiResult<List<BlogSemanticSearchResultDto>>> searchHybrid(
            @RequestParam(name = "q") String query,
            @RequestParam(name = "threshold", required = false) Double threshold,
            @RequestParam(name = "limit", required = false, defaultValue = "10") Integer limit
    ) {
        log.info("REST: Hibrit arama. Sorgu: '{}', Eşik: {}, Limit: {}", query, threshold, limit);
        List<BlogSemanticSearchResultDto> results = aiBlogService.searchHybrid(query, threshold, limit);
        return ResponseEntity.ok(ApiResult.success(results));
    }

    @Operation(summary = "Tüm Vektör Gömmelerini Yeniden İndeksle (Reindex Embeddings)", description = "Veritabanındaki tüm blogların vektör gömmelerini baştan hesaplayıp günceller (Sadece Admin).")
    @PostMapping("/reindex")
    public ResponseEntity<ApiResult<String>> reindexEmbeddings() {
        log.info("REST: Vektör indeksleme talebi alındı.");
        int count = aiBlogService.reindexAllBlogEmbeddings();
        return ResponseEntity.ok(ApiResult.success("Toplam " + count + " blog yazısı başarıyla vektör indeksine kaydedildi."));
    }
}

