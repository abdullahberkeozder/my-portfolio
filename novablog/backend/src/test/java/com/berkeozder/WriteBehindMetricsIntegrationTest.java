package com.berkeozder;

import com.berkeozder.business.metrics.BlogMetricFlushScheduler;
import com.berkeozder.business.metrics.IBlogMetricBufferService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Write-Behind Deseni Sayaç Tamponlama & Zamanlanmış Toplu DB Flush Entegrasyon Testleri.
 *
 * @author Berke Özder
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class WriteBehindMetricsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IBlogRepository blogRepository;

    @Autowired
    private IBlogCategoryRepository categoryRepository;

    @Autowired
    private IBlogMetricBufferService metricBufferService;

    @Autowired
    private BlogMetricFlushScheduler flushScheduler;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    private Long testBlogId;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }

        // Önceki testlerden kalan tamponu boşalt
        metricBufferService.drainViewBuffer();
        metricBufferService.drainLikeBuffer();

        BlogCategoryEntity category = categoryRepository.findByCategoryNameIgnoreCase("MetricsCategory")
                .orElseGet(() -> categoryRepository.save(BlogCategoryEntity.builder()
                        .categoryName("MetricsCategory")
                        .build()));

        BlogEntity blog = blogRepository.save(BlogEntity.builder()
                .header("MetricsBlogHeader-" + UUID.randomUUID())
                .title("Metrics Test Title")
                .content("Content for testing Write-Behind counters")
                .blogCategoryEntity(category)
                .version(0L)
                .viewsCount(0L)
                .likesCount(0L)
                .build());
        testBlogId = blog.getBlogId();
    }

    @Test
    @DisplayName("Write-Behind: Görüntülenme ve beğeni sayaçları tampon bellekte birikmeli ve GET anlık toplamı dönmelidir")
    void testViewAndLikeBufferIncrementAndLiveRead() throws Exception {
        // 1. 5 defa görüntülenme gönder (Kimlik doğrulaması gerektirmez)
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/blog/api/v1.0.0/" + testBlogId + "/view"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUCCESS"))
                    .andExpect(jsonPath("$.data.viewsCount").value(i));
        }

        // 2. 3 defa beğeni gönder
        for (int i = 1; i <= 3; i++) {
            mockMvc.perform(post("/blog/api/v1.0.0/" + testBlogId + "/like"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value("SUCCESS"))
                    .andExpect(jsonPath("$.data.likesCount").value(i));
        }

        // 3. 1 defa beğeniyi geri al (Unlike)
        mockMvc.perform(delete("/blog/api/v1.0.0/" + testBlogId + "/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.likesCount").value(2));

        // 4. Doğrula: Veritabanındaki satır henüz DEĞİŞMEMELİ (Write-Behind yalıtımı)
        BlogEntity rawInDbBeforeFlush = blogRepository.findById(testBlogId).orElseThrow();
        assertThat(rawInDbBeforeFlush.getViewsCount()).isEqualTo(0L);
        assertThat(rawInDbBeforeFlush.getLikesCount()).isEqualTo(0L);

        // 5. Doğrula: GET /blog/api/v1.0.0/{id} çağrıldığında tampon + DB toplamı (5 views, 2 likes) anında yansımalı
        MvcResult getResult = mockMvc.perform(get("/blog/api/v1.0.0/" + testBlogId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.viewsCount").value(5))
                .andExpect(jsonPath("$.data.likesCount").value(2))
                .andReturn();

        JsonNode responseJson = objectMapper.readTree(getResult.getResponse().getContentAsString());
        assertThat(responseJson.get("data").get("viewsCount").asLong()).isEqualTo(5L);
        assertThat(responseJson.get("data").get("likesCount").asLong()).isEqualTo(2L);
    }

    @Test
    @DisplayName("Write-Behind Flush: Manuel veya periyodik flush tamponu DB'ye aktarmalı ve @Version artmamalıdır")
    @WithMockUser(roles = "ADMIN")
    void testBatchFlushDrainsBufferAndUpdatesDatabase() throws Exception {
        // 1. Tampona 10 izlenme ve 4 beğeni ekle
        for (int i = 0; i < 10; i++) {
            metricBufferService.incrementView(testBlogId);
        }
        for (int i = 0; i < 4; i++) {
            metricBufferService.incrementLike(testBlogId);
        }

        BlogEntity dbEntityBeforeFlush = blogRepository.findById(testBlogId).orElseThrow();
        Long initialVersion = dbEntityBeforeFlush.getVersion();
        assertThat(dbEntityBeforeFlush.getViewsCount()).isEqualTo(0L);

        // 2. Admin endpointi üzerinden toplu flush tetikle
        mockMvc.perform(post("/blog/api/v1.0.0/metrics/flush"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // 3. Doğrula: Veritabanında sayaçlar kalıcı hale geldi
        BlogEntity dbEntityAfterFlush = blogRepository.findById(testBlogId).orElseThrow();
        assertThat(dbEntityAfterFlush.getViewsCount()).isEqualTo(10L);
        assertThat(dbEntityAfterFlush.getLikesCount()).isEqualTo(4L);

        // 4. Kritik Doğrulama: Native sayaç güncellemesi @Version sütununu artırmamalıdır
        // Böylece blog okuyan/beğenen kullanıcılar yazarın blogu düzenlemesini engellemez
        assertThat(dbEntityAfterFlush.getVersion()).isEqualTo(initialVersion);

        // 5. Doğrula: Tampon bellek boşaltıldı (0 bekleyen)
        assertThat(metricBufferService.getBufferedViews(testBlogId)).isEqualTo(0L);
        assertThat(metricBufferService.getBufferedLikes(testBlogId)).isEqualTo(0L);

        // 6. Doğrula: GET isteği DB'den doğru veriyi okumaya devam eder
        mockMvc.perform(get("/blog/api/v1.0.0/" + testBlogId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.viewsCount").value(10))
                .andExpect(jsonPath("$.data.likesCount").value(4));
    }

    @Test
    @DisplayName("Graceful Shutdown: Sunucu kapatılırken tamponda bekleyen metrikler DB'ye yazılmalıdır")
    void testGracefulShutdownFlushesRemainingMetrics() {
        metricBufferService.incrementView(testBlogId);
        metricBufferService.incrementView(testBlogId);
        metricBufferService.incrementLike(testBlogId);

        // Graceful shutdown tetikle
        flushScheduler.flushOnShutdown();

        // Veritabanını kontrol et
        BlogEntity entity = blogRepository.findById(testBlogId).orElseThrow();
        assertThat(entity.getViewsCount()).isGreaterThanOrEqualTo(2L);
        assertThat(entity.getLikesCount()).isGreaterThanOrEqualTo(1L);
    }
}
