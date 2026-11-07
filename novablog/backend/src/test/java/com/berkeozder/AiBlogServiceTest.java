package com.berkeozder;

import com.berkeozder.ai.client.IAiChatClient;
import com.berkeozder.ai.client.IAiEmbeddingClient;
import com.berkeozder.ai.config.AiProperties;
import com.berkeozder.ai.dto.AiSummaryResponseDto;
import com.berkeozder.ai.dto.AiTagSuggestionResponseDto;
import com.berkeozder.ai.dto.BlogSemanticSearchResultDto;
import com.berkeozder.ai.service.impl.AiBlogServiceImpl;
import com.berkeozder.ai.vector.VectorUtils;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.exception._404_NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AiBlogService Unit Tests (AI Business Operations)")
class AiBlogServiceTest {

    @Mock
    private IBlogRepository blogRepository;

    @Mock
    private IBlogCategoryRepository categoryRepository;

    @Mock
    private IAiChatClient aiChatClient;

    @Mock
    private IAiEmbeddingClient aiEmbeddingClient;

    @Mock
    private AiProperties aiProperties;

    @InjectMocks
    private AiBlogServiceImpl aiBlogService;

    private BlogEntity testBlog;
    private BlogCategoryEntity testCategory;

    @BeforeEach
    void setUp() {
        testCategory = BlogCategoryEntity.builder()
                .blogCategoryId(1L)
                .categoryName("Yazılım")
                .build();

        testBlog = BlogEntity.builder()
                .blogId(100L)
                .header("Spring Boot Mimarisi")
                .title("Enterprise Spring Boot")
                .content("Kurumsal Spring Boot uygulamalarında katmanlı mimari ve en iyi pratikler.")
                .blogCategoryEntity(testCategory)
                .isDeleted(false)
                .build();
    }

    @Test
    @DisplayName("Should generate summary and update blog entity with embedding")
    void generateAndSaveBlogSummary_shouldUpdateBlog() {
        when(blogRepository.findById(100L)).thenReturn(Optional.of(testBlog));
        when(aiChatClient.generateSummary(anyString(), anyString())).thenReturn(
                AiSummaryResponseDto.builder().summary("Kısa kurumsal özet.").build()
        );
        when(aiEmbeddingClient.generateEmbedding(anyString())).thenReturn(new float[]{0.1f, 0.2f});
        when(blogRepository.save(any(BlogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        BlogDto result = aiBlogService.generateAndSaveBlogSummary(100L);

        assertNotNull(result);
        assertEquals("Kısa kurumsal özet.", result.getAiSummary());
        assertTrue(result.isHasEmbedding());
        verify(blogRepository).save(testBlog);
    }

    @Test
    @DisplayName("Should throw 404 when blog not found for summary")
    void generateAndSaveBlogSummary_notFound_shouldThrowException() {
        when(blogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(_404_NotFoundException.class, () -> aiBlogService.generateAndSaveBlogSummary(999L));
    }

    @Test
    @DisplayName("Should perform semantic search and filter by similarity threshold")
    void searchSemantic_shouldFilterAndSortByCosineSimilarity() {
        float[] queryVec = new float[]{1.0f, 0.0f};
        float[] matchVec = new float[]{0.9f, 0.1f}; // high similarity
        float[] lowVec = new float[]{0.1f, 0.9f};   // low similarity

        testBlog.setEmbedding(VectorUtils.serialize(matchVec));

        BlogEntity lowMatchBlog = BlogEntity.builder()
                .blogId(101L)
                .header("Alakasız Başlık")
                .title("Alakasız")
                .content("Tamamen farklı içerik.")
                .blogCategoryEntity(testCategory)
                .embedding(VectorUtils.serialize(lowVec))
                .isDeleted(false)
                .build();

        when(aiEmbeddingClient.generateEmbedding("spring")).thenReturn(queryVec);
        when(blogRepository.findAll()).thenReturn(List.of(testBlog, lowMatchBlog));

        List<BlogSemanticSearchResultDto> results = aiBlogService.searchSemantic("spring", 0.50, 10);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getBlogId());
        assertEquals("SEMANTIC", results.get(0).getSearchType());
    }

    @Test
    @DisplayName("Should perform hybrid search combining keyword and vector score")
    void searchHybrid_shouldCombineScores() {
        float[] queryVec = new float[]{1.0f, 0.0f};
        float[] matchVec = new float[]{0.8f, 0.2f};

        testBlog.setEmbedding(VectorUtils.serialize(matchVec));

        when(aiEmbeddingClient.generateEmbedding("Spring Boot")).thenReturn(queryVec);
        when(blogRepository.findAll()).thenReturn(List.of(testBlog));

        List<BlogSemanticSearchResultDto> results = aiBlogService.searchHybrid("Spring Boot", 0.40, 10);

        assertNotNull(results);
        assertFalse(results.isEmpty());
        assertEquals(100L, results.get(0).getBlogId());
        assertEquals("HYBRID", results.get(0).getSearchType());
        assertTrue(results.get(0).getCombinedScore() > 0.0);
    }

    @Test
    @DisplayName("Should reindex all blog embeddings in batch")
    void reindexAllBlogEmbeddings_shouldUpdateAllBlogs() {
        when(blogRepository.findAll()).thenReturn(List.of(testBlog));
        when(aiEmbeddingClient.generateEmbedding(anyString())).thenReturn(new float[]{0.5f, 0.5f});
        when(blogRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        int count = aiBlogService.reindexAllBlogEmbeddings();

        assertEquals(1, count);
        verify(blogRepository).saveAll(anyList());
    }
}
