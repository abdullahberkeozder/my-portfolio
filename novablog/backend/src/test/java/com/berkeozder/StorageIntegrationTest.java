package com.berkeozder;

import com.berkeozder.security.ratelimit.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class StorageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }
    }

    @Test
    @DisplayName("Depolama Bilgisi: GET /storage/info aktif depolama tipini dönmelidir")
    void testGetStorageInfo_ShouldReturnActiveStorageType() throws Exception {
        mockMvc.perform(get("/blog/api/v1.0.0/storage/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.storageType").value("LOCAL"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Presigned URL: GET /storage/presigned geçerli bağlantı dönmelidir")
    void testGetPresignedUrl_ShouldReturnUrl() throws Exception {
        mockMvc.perform(get("/blog/api/v1.0.0/storage/presigned")
                        .param("url", "/upload/blog/sample.jpg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.presignedUrl").value("/upload/blog/sample.jpg"));
    }
}

