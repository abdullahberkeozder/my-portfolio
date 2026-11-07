package com.berkeozder;

import com.berkeozder.ai.dto.AiModerationRequestDto;
import com.berkeozder.ai.dto.AiSummaryRequestDto;
import com.berkeozder.ai.dto.AiTagSuggestionRequestDto;
import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Spring AI & Semantic Search Integration Tests")
public class AiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }
    }

    private String getAdminToken() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("root")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "192.168.130.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("accessToken").asText();
    }

    private Long createTestCategory(String token, String name) throws Exception {
        BlogCategoryDto categoryDto = BlogCategoryDto.builder()
                .categoryName(name + "_" + UUID.randomUUID().toString().substring(0, 6))
                .build();

        MvcResult result = mockMvc.perform(post("/blog/category/api/v1.0.0/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryDto)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("blogCategoryId").asLong();
    }

    private Long createTestBlog(String token, Long categoryId, String prefix) throws Exception {
        BlogDto blogDto = BlogDto.builder()
                .header(prefix + "-" + UUID.randomUUID().toString().substring(0, 6))
                .title("AI Test Title")
                .content("AI Vector Content")
                .blogCategoryDto(BlogCategoryDto.builder().blogCategoryId(categoryId).build())
                .build();

        MvcResult result = mockMvc.perform(post("/blog/api/v1.0.0/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blogDto)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("blogId").asLong();
    }

    @Test
    @DisplayName("POST /api/v1/ai/summarize-text should return concise summary and compression rate")
    void testSummarizeTextEndpoint() throws Exception {
        AiSummaryRequestDto request = AiSummaryRequestDto.builder()
                .title("Spring Boot AI Mimarisi")
                .text("Spring Boot ile yapay zeka entegrasyonu modern backend sistemlerinin temelini oluşturmaktadır. " +
                        "Vektör gömmeleri ve LLM modelleri sayesinde anlamsal arama ve otomatik özetleme özellikleri dakikalar içinde devreye alınabilir. " +
                        "Bu mimari kurumsal blog sistemlerine yüksek katma değer ve üstün kullanıcı deneyimi kazandırır.")
                .build();

        mockMvc.perform(post("/api/v1/ai/summarize-text")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.summary").isNotEmpty())
                .andExpect(jsonPath("$.data.originalCharacterCount").isNumber())
                .andExpect(jsonPath("$.data.compressionRatePercent").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/ai/suggest-tags should return recommended tags and category")
    void testSuggestTagsEndpoint() throws Exception {
        AiTagSuggestionRequestDto request = AiTagSuggestionRequestDto.builder()
                .title("Docker ve Kubernetes ile Mikroservis Dağıtımı")
                .content("Container teknolojileri ve Kubernetes orkestrasyonu bulut ortamlarında servis ölçeklendirmeyi otomatikleştirir.")
                .build();

        mockMvc.perform(post("/api/v1/ai/suggest-tags")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.suggestedTags").isArray())
                .andExpect(jsonPath("$.data.confidenceScore").isNumber());
    }

    @Test
    @DisplayName("POST /api/v1/ai/moderate should detect toxicity and sentiment")
    void testModerateEndpoint() throws Exception {
        AiModerationRequestDto request = AiModerationRequestDto.builder()
                .text("Harika bir anlatım olmuş, elinize sağlık çok faydalı!")
                .build();

        mockMvc.perform(post("/api/v1/ai/moderate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.flagged").value(false))
                .andExpect(jsonPath("$.data.sentiment").value("POSITIVE"));
    }

    @Test
    @DisplayName("GET /api/v1/ai/search/semantic and /hybrid should return matched results with similarity scores")
    void testSemanticAndHybridSearchEndpoints() throws Exception {
        String token = getAdminToken();
        Long catId = createTestCategory(token, "AI");

        createTestBlog(token, catId, "AI-VEC");

        // Semantic Search
        mockMvc.perform(get("/api/v1/ai/search/semantic")
                        .param("q", "Vector Content")
                        .param("threshold", "0.20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").isArray());

        // Hybrid Search
        mockMvc.perform(get("/api/v1/ai/search/hybrid")
                        .param("q", "AI Vector")
                        .param("threshold", "0.20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("POST /api/v1/ai/summarize/{blogId} and /reindex should work with ADMIN token")
    void testSummarizeBlogAndReindexEndpoints() throws Exception {
        String token = getAdminToken();
        Long catId = createTestCategory(token, "Backend");

        Long blogId = createTestBlog(token, catId, "AI-SUM");

        // Summarize Blog
        mockMvc.perform(post("/api/v1/ai/summarize/" + blogId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.aiSummary").isNotEmpty())
                .andExpect(jsonPath("$.data.hasEmbedding").value(true));

        // Reindex Embeddings
        mockMvc.perform(post("/api/v1/ai/reindex")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }
}
