package com.berkeozder;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.services.interfaces.IBlogServices;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * JPA @Version Optimistic Locking & RFC 7807 Conflict Entegrasyon Testleri.
 * Eşzamanlı düzenleme (concurrent write) çakışmalarını ve HTTP 409 Conflict yanıtını doğrular.
 *
 * @author Berke Özder
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class OptimisticLockingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IBlogRepository blogRepository;

    @Autowired
    private IBlogCategoryRepository categoryRepository;

    @Autowired
    private IBlogServices<BlogDto, BlogEntity> blogServices;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    private Long testBlogId;
    private Long testCategoryId;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }

        // Test Kategorisi oluştur veya bul
        BlogCategoryEntity category = categoryRepository.findByCategoryNameIgnoreCase("OptimisticTestCategory")
                .orElseGet(() -> categoryRepository.save(BlogCategoryEntity.builder()
                        .categoryName("OptimisticTestCategory")
                        .build()));
        testCategoryId = category.getBlogCategoryId();

        // Test Blogu oluştur (Header, title ve content 5-25 karakter validasyon aralığında olmalıdır)
        long suffix = System.currentTimeMillis() % 100000;
        String uniqueHeader = "Hdr-" + suffix;
        BlogEntity blog = blogRepository.save(BlogEntity.builder()
                .header(uniqueHeader)
                .title("Initial Title")
                .content("Initial Valid Content")
                .blogCategoryEntity(category)
                .version(0L)
                .viewsCount(0L)
                .likesCount(0L)
                .build());
        testBlogId = blog.getBlogId();
    }

    @Test
    @DisplayName("Eski versiyon (stale version) ile güncelleme yapıldığında HTTP 409 Conflict ve RFC 7807 dönmelidir")
    @WithMockUser(roles = "ADMIN")
    void testConcurrentUpdateCausesOptimisticLockConflict_Returns409() throws Exception {
        long suffix = System.currentTimeMillis() % 100000;

        // 1. Kullanıcı A ve Kullanıcı B aynı anda blogu okur (version = 0)
        BlogDto userAFetched = blogServices.objectServiceFindById(testBlogId);
        BlogDto userBFetched = blogServices.objectServiceFindById(testBlogId);

        assertThat(userAFetched.getVersion()).isEqualTo(0L);
        assertThat(userBFetched.getVersion()).isEqualTo(0L);

        // 2. Kullanıcı A güncellemesini kaydeder (version -> 1 olur)
        userAFetched.setTitle("Title User A");
        userAFetched.setHeader("Hdr-A-" + suffix);
        userAFetched.setContent("Content User A");
        blogServices.objectServiceUpdate(testBlogId, userAFetched);

        // Doğrula: Veritabanında yeni version = 1 oldu
        BlogEntity updatedInDb = blogRepository.findById(testBlogId).orElseThrow();
        assertThat(updatedInDb.getVersion()).isGreaterThan(0L);

        // 3. Kullanıcı B eski (stale) version=0 ile REST API üzerinden güncellemeye çalışır
        userBFetched.setTitle("Title User B");
        userBFetched.setHeader("Hdr-B-" + suffix);
        userBFetched.setContent("Content User B");
        userBFetched.setBlogCategoryDto(BlogCategoryDto.builder().blogCategoryId(testCategoryId).build());

        MvcResult result = mockMvc.perform(put("/blog/api/v1.0.0/" + testBlogId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userBFetched)))
                .andExpect(status().isConflict())
                .andExpect(content().contentType(MediaType.APPLICATION_PROBLEM_JSON))
                .andReturn();

        // 4. RFC 7807 Problem Details alanlarını doğrula
        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(json.has("type")).isTrue();
        assertThat(json.get("type").asText()).contains("optimistic-lock-conflict");
        assertThat(json.get("title").asText()).isEqualTo("Conflict - Stale Object State");
        assertThat(json.get("status").asInt()).isEqualTo(409);
        assertThat(json.get("conflictType").asText()).isEqualTo("OPTIMISTIC_LOCK_VERSION_MISMATCH");
    }
}
