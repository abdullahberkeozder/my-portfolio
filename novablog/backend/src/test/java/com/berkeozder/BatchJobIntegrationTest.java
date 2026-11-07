package com.berkeozder;

import com.berkeozder.batch.service.IBatchJobService;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.IUserRepository;
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

import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@DisplayName("Spring Batch ETL & Automation Integration Tests")
class BatchJobIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IBatchJobService batchJobService;

    @Autowired
    private IBlogRepository blogRepository;

    @Autowired
    private IBlogCategoryRepository categoryRepository;

    @Autowired
    private IUserRepository userRepository;

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
                        .header("X-Forwarded-For", "192.168.220.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("1. Soft-Delete Temizleme Batch Job: Belirtilen eşikten eski silinmiş blogları kalıcı temizlemelidir")
    void shouldExecuteCleanupSoftDeletedJobEndToEnd() {
        UserEntity admin = userRepository.findByUsername("admin")
                .orElseThrow(() -> new IllegalStateException("Admin kullanıcısı bulunamadı"));

        BlogCategoryEntity category = categoryRepository.findAll().stream().findFirst()
                .orElseGet(() -> categoryRepository.save(BlogCategoryEntity.builder().categoryName("BatchTestCat").build()));

        long timestamp = System.currentTimeMillis();

        // 1. Aktif blog (silinmemiş) - Kalıcı silinmemeli
        BlogEntity activeBlog = blogRepository.save(BlogEntity.builder()
                .header("Aktif Blog " + timestamp)
                .title("Aktif Başlık")
                .content("Aktif blog içeriği")
                .author(admin)
                .blogCategoryEntity(category)
                .isDeleted(false)
                .build());

        // 2. Eski silinmiş blog (40 gün önce silinmiş) - Kalıcı silinmeli
        Date fortyDaysAgo = new Date(System.currentTimeMillis() - (40L * 24L * 60L * 60L * 1000L));
        BlogEntity oldDeletedBlog = blogRepository.save(BlogEntity.builder()
                .header("Eski Silinmiş Blog " + timestamp)
                .title("Eski Silinmiş Başlık")
                .content("Eski silinmiş içerik")
                .author(admin)
                .blogCategoryEntity(category)
                .isDeleted(true)
                .deletedAt(fortyDaysAgo)
                .build());

        Long activeBlogId = activeBlog.getBlogId();
        Long oldDeletedBlogId = oldDeletedBlog.getBlogId();

        // 30 günden eski olanları temizle
        JobExecutionResponseDto executionResponse = batchJobService.runCleanupJob(30);

        assertThat(executionResponse).isNotNull();
        assertThat(executionResponse.getStatus()).isEqualTo("COMPLETED");

        // Aktif blog hala veritabanında mevcut olmalı
        Optional<BlogEntity> foundActive = blogRepository.findById(activeBlogId);
        assertThat(foundActive).isPresent();

        // Eski silinmiş blog ise kalıcı silinmiş (hard deleted) olmalı
        Optional<BlogEntity> foundDeleted = blogRepository.findDeletedBlogByIdNative(oldDeletedBlogId);
        assertThat(foundDeleted).isEmpty();
    }

    @Test
    @DisplayName("2. Yazar Analitik Batch Job: Yazar metriklerini hesaplayıp CSV ve bellek raporuna yazmalıdır")
    void shouldExecuteAuthorAnalyticsJobEndToEnd() {
        JobExecutionResponseDto executionResponse = batchJobService.runAuthorAnalyticsJob();

        assertThat(executionResponse).isNotNull();
        assertThat(executionResponse.getStatus()).isEqualTo("COMPLETED");
        assertThat(executionResponse.getJobName()).isEqualTo("authorAnalyticsJob");
        assertThat(executionResponse.getStepExecutions()).isNotEmpty();

        var reports = batchJobService.getLatestAuthorAnalyticsReport();
        assertThat(reports).isNotNull();
    }

    @Test
    @DisplayName("3. REST API: ADMIN kullanıcısı /api/v1/batch/jobs endpoints'lerini tetikleyebilmeli ve sorgulayabilmelidir")
    void shouldAccessBatchApiWithAdminToken() throws Exception {
        String token = getAdminToken();

        // POST /api/v1/batch/jobs/cleanup
        mockMvc.perform(post("/api/v1/batch/jobs/cleanup")
                        .header("Authorization", "Bearer " + token)
                        .param("daysOld", "60")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.jobName").value("cleanupSoftDeletedJob"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // POST /api/v1/batch/jobs/analytics
        mockMvc.perform(post("/api/v1/batch/jobs/analytics")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.jobName").value("authorAnalyticsJob"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));

        // GET /api/v1/batch/jobs/executions
        mockMvc.perform(get("/api/v1/batch/jobs/executions")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").isArray());

        // GET /api/v1/batch/jobs/analytics/report
        mockMvc.perform(get("/api/v1/batch/jobs/analytics/report")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @DisplayName("4. Güvenlik: Yetkisiz (anonim) kullanıcılar batch API'lerine erişememelidir")
    void shouldDenyUnauthenticatedAccessToBatchApi() throws Exception {
        mockMvc.perform(post("/api/v1/batch/jobs/cleanup")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/batch/jobs/analytics")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/batch/jobs/executions")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
