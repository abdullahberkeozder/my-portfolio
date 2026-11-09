package com.berkeozder.ai.service.impl;

import com.berkeozder.ai.client.IAiChatClient;
import com.berkeozder.ai.client.IAiEmbeddingClient;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import com.berkeozder.ai.dto.BlogSemanticSearchResultDto;
import com.berkeozder.ai.service.IAiBlogService;
import com.berkeozder.ai.vector.VectorUtils;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;
import com.berkeozder.data.mapper.BlogMapper;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.exception._404_NotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Spring AI & Vektör Arama İş Mantığı Servis Uygulaması.
 * Kosinüs Benzerliği, Hibrit Arama Füzyonu, Otomatik Özetleme ve Etiketleme sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class AiBlogServiceImpl implements IAiBlogService {

    private final IBlogRepository blogRepository;
    private final IBlogCategoryRepository categoryRepository;
    private final IAiChatClient aiChatClient;
    private final IAiEmbeddingClient aiEmbeddingClient;
    private final AiProperties aiProperties;
    private final DataSource dataSource;
    private final BlogMapper blogMapper = new BlogMapper();
    private volatile Boolean isPostgreSql = null;

    private boolean isPostgreSqlDatabase() {
        if (isPostgreSql != null) {
            return isPostgreSql;
        }
        if (dataSource == null) {
            isPostgreSql = Boolean.FALSE;
            return false;
        }
        try (var conn = dataSource.getConnection()) {
            String dbName = conn.getMetaData().getDatabaseProductName();
            isPostgreSql = (dbName != null && dbName.toLowerCase(Locale.ROOT).contains("postgresql"));
        } catch (Exception e) {
            log.warn("Database metadata check failed, defaulting to in-memory vector search: {}", e.getMessage());
            isPostgreSql = Boolean.FALSE;
        }
        return isPostgreSql;
    }

    @Override
    @Transactional
    public BlogDto generateAndSaveBlogSummary(Long blogId) {
        BlogEntity blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new _404_NotFoundException("Özetlenecek blog bulunamadı. ID: " + blogId));

        String title = blog.getTitle() != null && !blog.getTitle().isBlank() ? blog.getTitle() : blog.getHeader();
        AiSummaryResponseDto summaryResponse = aiChatClient.generateSummary(title, blog.getContent());

        blog.setAiSummary(summaryResponse.getSummary());

        // Vektör gömmesi eksikse hazırda üret
        if (blog.getEmbedding() == null || blog.getEmbedding().isBlank() || "[]".equals(blog.getEmbedding())) {
            float[] vector = aiEmbeddingClient.generateEmbedding(blog.getHeader() + " " + title + " " + blog.getContent());
            blog.setEmbedding(VectorUtils.serialize(vector));
        }

        BlogEntity saved = blogRepository.save(blog);
        log.info("Blog (ID: {}) için AI özeti başarıyla oluşturuldu ve kaydedildi.", blogId);
        return blogMapper.toDto(saved);
    }

    @Override
    public AiSummaryResponseDto summarizeText(String text, String title) {
        return aiChatClient.generateSummary(title, text);
    }

    @Override
    @Transactional(readOnly = true)
    public AiTagSuggestionResponseDto suggestTagsAndCategory(String title, String content) {
        List<BlogCategoryEntity> categories = categoryRepository.findAll();
        Map<Long, String> categoryMap = categories.stream()
                .collect(Collectors.toMap(
                        BlogCategoryEntity::getBlogCategoryId,
                        BlogCategoryEntity::getCategoryName,
                        (existing, replacement) -> existing
                ));

        return aiChatClient.suggestTagsAndCategory(title, content, categoryMap);
    }

    @Override
    @Transactional
    public List<BlogSemanticSearchResultDto> searchSemantic(String query, Double threshold, Integer limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        double minSimilarity = (threshold != null) ? threshold : aiProperties.getSimilarityThreshold();
        int maxResults = (limit != null && limit > 0) ? limit : 10;

        float[] queryVector = aiEmbeddingClient.generateEmbedding(query);
        String vectorLiteral = VectorUtils.serialize(queryVector);

        // 1. PostgreSQL pgvector native HNSW index search
        if (isPostgreSqlDatabase()) {
            try {
                List<BlogEntity> nativeResults = blogRepository.findByPgVectorSimilarityNative(vectorLiteral, maxResults);
                if (nativeResults != null && !nativeResults.isEmpty()) {
                    List<BlogSemanticSearchResultDto> results = new ArrayList<>();
                    for (BlogEntity blog : nativeResults) {
                        float[] blogVector = VectorUtils.deserialize(blog.getEmbedding());
                        double similarity = VectorUtils.cosineSimilarity(queryVector, blogVector);
                        if (similarity >= minSimilarity) {
                            results.add(mapToSearchResult(blog, similarity, 0.0, similarity, "PGVECTOR_NATIVE"));
                        }
                    }
                    if (!results.isEmpty()) {
                        return results;
                    }
                }
            } catch (Exception ex) {
                log.debug("Native pgvector query not available ({}), falling back to in-memory cosine engine: {}",
                        ex.getClass().getSimpleName(), ex.getMessage());
            }
        }

        // 2. Fallback: In-memory cosine search (H2 / dev profile)
        return executeInMemorySemanticSearch(queryVector, minSimilarity, maxResults);
    }

    private List<BlogSemanticSearchResultDto> executeInMemorySemanticSearch(float[] queryVector, double minSimilarity, int maxResults) {
        List<BlogEntity> activeBlogs = blogRepository.findAll();
        List<BlogSemanticSearchResultDto> results = new ArrayList<>();

        for (BlogEntity blog : activeBlogs) {
            if (blog.isDeleted()) {
                continue;
            }

            float[] blogVector;
            if (blog.getEmbedding() == null || blog.getEmbedding().isBlank() || "[]".equals(blog.getEmbedding())) {
                String textToEmbed = (blog.getHeader() != null ? blog.getHeader() : "") + " " +
                        (blog.getTitle() != null ? blog.getTitle() : "") + " " +
                        (blog.getContent() != null ? blog.getContent() : "");
                blogVector = aiEmbeddingClient.generateEmbedding(textToEmbed);
                blog.setEmbedding(VectorUtils.serialize(blogVector));
                blogRepository.save(blog);
            } else {
                blogVector = VectorUtils.deserialize(blog.getEmbedding());
            }

            double similarity = VectorUtils.cosineSimilarity(queryVector, blogVector);
            if (similarity >= minSimilarity) {
                results.add(mapToSearchResult(blog, similarity, 0.0, similarity, "SEMANTIC"));
            }
        }

        results.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return results.stream().limit(maxResults).toList();
    }

    @Override
    @Transactional
    public List<BlogSemanticSearchResultDto> searchHybrid(String query, Double threshold, Integer limit) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        double minSimilarity = (threshold != null) ? threshold : (aiProperties.getSimilarityThreshold() - 0.10);
        int maxResults = (limit != null && limit > 0) ? limit : 10;

        float[] queryVector = aiEmbeddingClient.generateEmbedding(query);
        String vectorLiteral = VectorUtils.serialize(queryVector);

        // 1. PostgreSQL native Reciprocal Rank Fusion (RRF) using HNSW + GIN indexes
        if (isPostgreSqlDatabase()) {
            try {
                int candidateLimit = Math.max(50, maxResults * 5);
                List<BlogEntity> nativeResults = blogRepository.findByRrfHybridSearchNative(query, vectorLiteral, candidateLimit, maxResults);
                if (nativeResults != null && !nativeResults.isEmpty()) {
                    List<BlogSemanticSearchResultDto> results = new ArrayList<>();
                    for (BlogEntity blog : nativeResults) {
                        float[] blogVector = VectorUtils.deserialize(blog.getEmbedding());
                        double semanticScore = VectorUtils.cosineSimilarity(queryVector, blogVector);
                        results.add(mapToSearchResult(blog, semanticScore, 1.0, semanticScore, "RRF_PGVECTOR_HYBRID"));
                    }
                    return results;
                }
            } catch (Exception ex) {
                log.debug("Native RRF hybrid query not available ({}), falling back to in-memory fusion: {}",
                        ex.getClass().getSimpleName(), ex.getMessage());
            }
        }

        // 2. Fallback: In-memory weighted fusion (H2 / dev profile)
        return executeInMemoryHybridSearch(query, queryVector, minSimilarity, maxResults);
    }

    private List<BlogSemanticSearchResultDto> executeInMemoryHybridSearch(String query, float[] queryVector, double minSimilarity, int maxResults) {
        List<BlogEntity> activeBlogs = blogRepository.findAll();
        String lowerQuery = query.toLowerCase(Locale.ROOT);
        String[] queryTerms = lowerQuery.split("\\s+");
        List<BlogSemanticSearchResultDto> results = new ArrayList<>();

        for (BlogEntity blog : activeBlogs) {
            if (blog.isDeleted()) {
                continue;
            }

            float[] blogVector;
            if (blog.getEmbedding() == null || blog.getEmbedding().isBlank() || "[]".equals(blog.getEmbedding())) {
                String textToEmbed = (blog.getHeader() != null ? blog.getHeader() : "") + " " +
                        (blog.getTitle() != null ? blog.getTitle() : "") + " " +
                        (blog.getContent() != null ? blog.getContent() : "");
                blogVector = aiEmbeddingClient.generateEmbedding(textToEmbed);
                blog.setEmbedding(VectorUtils.serialize(blogVector));
                blogRepository.save(blog);
            } else {
                blogVector = VectorUtils.deserialize(blog.getEmbedding());
            }
            double semanticScore = VectorUtils.cosineSimilarity(queryVector, blogVector);

            String targetText = ((blog.getHeader() != null ? blog.getHeader() : "") + " " +
                    (blog.getTitle() != null ? blog.getTitle() : "") + " " +
                    (blog.getContent() != null ? blog.getContent() : "")).toLowerCase(Locale.ROOT);

            int matchedTerms = 0;
            for (String term : queryTerms) {
                if (term.length() >= 2 && targetText.contains(term)) {
                    matchedTerms++;
                }
            }
            double keywordScore = queryTerms.length > 0 ? (matchedTerms / (double) queryTerms.length) : 0.0;
            double combinedScore = (0.60 * semanticScore) + (0.40 * keywordScore);

            if (combinedScore >= minSimilarity || semanticScore >= minSimilarity || keywordScore > 0.6) {
                results.add(mapToSearchResult(blog, semanticScore, keywordScore, combinedScore, "HYBRID"));
            }
        }

        results.sort((a, b) -> Double.compare(b.getCombinedScore(), a.getCombinedScore()));
        return results.stream().limit(maxResults).toList();
    }

    @Override
    @Transactional
    public int reindexAllBlogEmbeddings() {
        List<BlogEntity> blogs = blogRepository.findAll();
        int count = 0;
        for (BlogEntity blog : blogs) {
            String text = (blog.getHeader() != null ? blog.getHeader() : "") + " " +
                    (blog.getTitle() != null ? blog.getTitle() : "") + " " +
                    (blog.getContent() != null ? blog.getContent() : "");
            float[] vector = aiEmbeddingClient.generateEmbedding(text);
            blog.setEmbedding(VectorUtils.serialize(vector));
            count++;
        }
        blogRepository.saveAll(blogs);
        log.info("Toplam {} blog yazısının vektör gömmeleri başarıyla yeniden indekslendi.", count);
        return count;
    }

    @Override
    @Transactional
    public void indexBlogEmbedding(Long blogId) {
        blogRepository.findById(blogId).ifPresent(blog -> {
            String text = (blog.getHeader() != null ? blog.getHeader() : "") + " " +
                    (blog.getTitle() != null ? blog.getTitle() : "") + " " +
                    (blog.getContent() != null ? blog.getContent() : "");
            float[] vector = aiEmbeddingClient.generateEmbedding(text);
            blog.setEmbedding(VectorUtils.serialize(vector));
            blogRepository.save(blog);
        });
    }

    private BlogSemanticSearchResultDto mapToSearchResult(BlogEntity blog, double similarity, double keyword, double combined, String type) {
        String content = blog.getContent() != null ? blog.getContent() : "";
        String excerpt = content.length() > 160 ? content.substring(0, 157) + "..." : content;

        Set<String> tagNames = (blog.getTags() != null)
                ? blog.getTags().stream().map(TagEntity::getName).collect(Collectors.toSet())
                : Collections.emptySet();

        String categoryName = (blog.getBlogCategoryEntity() != null)
                ? blog.getBlogCategoryEntity().getCategoryName()
                : null;

        return BlogSemanticSearchResultDto.builder()
                .blogId(blog.getBlogId())
                .header(blog.getHeader())
                .title(blog.getTitle())
                .contentExcerpt(excerpt)
                .image(blog.getImage())
                .categoryName(categoryName)
                .tags(tagNames)
                .aiSummary(blog.getAiSummary())
                .similarityScore(Math.round(similarity * 1000.0) / 1000.0)
                .keywordScore(Math.round(keyword * 1000.0) / 1000.0)
                .combinedScore(Math.round(combined * 1000.0) / 1000.0)
                .searchType(type)
                .build();
    }
}

