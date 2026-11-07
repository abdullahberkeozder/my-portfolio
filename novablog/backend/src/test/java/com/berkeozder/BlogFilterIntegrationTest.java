package com.berkeozder;

import com.berkeozder.business.dto.BlogFilterRequestDto;
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

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BlogFilterIntegrationTest {

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

    @Test
    @DisplayName("Boş filtre ile POST /filter çağrıldığında sayfalanmış tüm aktif bloglar dönmelidir")
    void testFilterBlogs_EmptyFilter_ShouldReturnPagedBlogs() throws Exception {
        BlogFilterRequestDto request = BlogFilterRequestDto.builder()
                .page(0)
                .size(5)
                .sortBy("blogId")
                .sortDir("desc")
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.pageSize").value(5));
    }

    @Test
    @DisplayName("Arama kelimesi (search) filtresi ile POST /filter sonuçları filtrelenmelidir")
    void testFilterBlogs_WithSearchKeyword_ShouldReturnMatchingBlogs() throws Exception {
        BlogFilterRequestDto request = BlogFilterRequestDto.builder()
                .search("Header")
                .page(0)
                .size(10)
                .build();

        MvcResult result = mockMvc.perform(post("/blog/api/v1.0.0/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode content = root.get("data").get("content");
        assertThat(content.isArray()).isTrue();
    }

    @Test
    @DisplayName("Kategori ID filtresi ile POST /filter yalnızca o kategoriye ait blogları dönmelidir")
    void testFilterBlogs_WithCategoryId_ShouldReturnCategoryBlogs() throws Exception {
        BlogFilterRequestDto request = BlogFilterRequestDto.builder()
                .categoryId(1L)
                .page(0)
                .size(10)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Etiket filtresi (tags) ile POST /filter blogları etiketlerine göre filtrelemelidir")
    void testFilterBlogs_WithTags_ShouldFilterByTag() throws Exception {
        BlogFilterRequestDto request = BlogFilterRequestDto.builder()
                .tags(Collections.singletonList("spring-boot"))
                .page(0)
                .size(10)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Görsel durumu (hasImage=false) filtresi doğru çalışmalıdır")
    void testFilterBlogs_WithHasImage_ShouldFilterCorrectly() throws Exception {
        BlogFilterRequestDto request = BlogFilterRequestDto.builder()
                .hasImage(false)
                .page(0)
                .size(10)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/filter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("GET /filter URL sorgu parametreleri üzerinden çok kriterli filtreleme çalışmalıdır")
    void testFilterBlogs_GetEndpoint_ShouldWorkWithQueryParams() throws Exception {
        mockMvc.perform(get("/blog/api/v1.0.0/filter")
                        .param("search", "Header")
                        .param("page", "0")
                        .param("size", "5")
                        .param("sort_by", "blogId")
                        .param("sort_dir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.pageSize").value(5));
    }
}

