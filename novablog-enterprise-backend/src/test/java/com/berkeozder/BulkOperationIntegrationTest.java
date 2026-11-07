package com.berkeozder;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.bulk.BulkActionType;
import com.berkeozder.business.dto.bulk.BulkOperationRequestDto;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BulkOperationIntegrationTest {

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
                        .header("X-Forwarded-For", "192.168.120.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("accessToken").asText();
    }

    private String getUserToken() throws Exception {
        long timestamp = System.currentTimeMillis();
        RegisterRequestDto request = RegisterRequestDto.builder()
                .username("bulkuser_" + timestamp)
                .email("bulk_" + timestamp + "@example.com")
                .password("Password123")
                .firstName("Bulk")
                .lastName("User")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-Forwarded-For", "192.168.120.2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        return responseNode.get("data").get("accessToken").asText();
    }

    private Long createTestBlog(String token, String prefix) throws Exception {
        BlogDto blogDto = BlogDto.builder()
                .header(prefix + "-" + UUID.randomUUID().toString().substring(0, 8))
                .title("Bulk Test Title")
                .content("Bulk Content")
                .blogCategoryDto(BlogCategoryDto.builder().blogCategoryId(1L).build())
                .build();

        MvcResult result = mockMvc.perform(post("/blog/api/v1.0.0/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(blogDto)))
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("blogId").asLong();
    }

    @Test
    @DisplayName("Admin kullanıcısı birden çok blogu tek seferde toplu soft delete ve restore yapabilmelidir")
    void testBulkSoftDeleteAndRestore() throws Exception {
        String token = getAdminToken();
        Long blogId1 = createTestBlog(token, "B-SD1");
        Long blogId2 = createTestBlog(token, "B-SD2");

        // 1. Toplu Soft Delete
        BulkOperationRequestDto deleteRequest = BulkOperationRequestDto.builder()
                .blogIds(Arrays.asList(blogId1, blogId2))
                .action(BulkActionType.SOFT_DELETE)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(deleteRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.action").value("SOFT_DELETE"))
                .andExpect(jsonPath("$.data.affectedCount").value(2));

        // 2. Toplu Restore
        BulkOperationRequestDto restoreRequest = BulkOperationRequestDto.builder()
                .blogIds(Arrays.asList(blogId1, blogId2))
                .action(BulkActionType.RESTORE)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(restoreRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.action").value("RESTORE"))
                .andExpect(jsonPath("$.data.affectedCount").value(2));
    }

    @Test
    @DisplayName("Admin kullanıcısı blogların kategorisini toplu olarak değiştirebilmelidir")
    void testBulkChangeCategory() throws Exception {
        String token = getAdminToken();
        Long blogId = createTestBlog(token, "B-CAT");

        BulkOperationRequestDto request = BulkOperationRequestDto.builder()
                .blogIds(Collections.singletonList(blogId))
                .action(BulkActionType.CHANGE_CATEGORY)
                .targetCategoryId(2L)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.action").value("CHANGE_CATEGORY"))
                .andExpect(jsonPath("$.data.affectedCount").value(1));
    }

    @Test
    @DisplayName("Admin kullanıcısı bloglara toplu etiket ekleyebilmelidir")
    void testBulkAddTags() throws Exception {
        String token = getAdminToken();
        Long blogId = createTestBlog(token, "B-TAG");

        BulkOperationRequestDto request = BulkOperationRequestDto.builder()
                .blogIds(Collections.singletonList(blogId))
                .action(BulkActionType.ADD_TAG)
                .tags(Arrays.asList("bulk-tag-a", "bulk-tag-b"))
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.action").value("ADD_TAG"))
                .andExpect(jsonPath("$.data.affectedCount").value(1));
    }

    @Test
    @DisplayName("Kimlik doğrulaması olmadan POST /bulk çağrısı engellenmelidir (401 veya 403)")
    void testBulk_WithoutAuth_ShouldReturn401Or403() throws Exception {
        BulkOperationRequestDto request = BulkOperationRequestDto.builder()
                .blogIds(Collections.singletonList(1L))
                .action(BulkActionType.SOFT_DELETE)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("Normal kullanıcı (ROLE_USER) admin gerektiren POST /bulk çağrısını yapamamalıdır (403 Forbidden)")
    void testBulk_WithUserRole_ShouldReturn403Forbidden() throws Exception {
        String userToken = getUserToken();

        BulkOperationRequestDto request = BulkOperationRequestDto.builder()
                .blogIds(Collections.singletonList(1L))
                .action(BulkActionType.SOFT_DELETE)
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/bulk")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
