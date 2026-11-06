package com.berkeozder;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SoftDeleteIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("Blog silindiğinde fiziksel silinmemeli (Soft Delete) ve admin tarafından geri yüklenebilmelidir")
    void testBlogSoftDeleteAndRestore() throws Exception {
        String token = getAdminToken();

        // 1. Yeni blog oluştur
        String header = "SD-Blog-" + UUID.randomUUID().toString().substring(0, 8);
        BlogDto newBlog = BlogDto.builder()
                .header(header)
                .title("Soft Delete Test")
                .content("Soft Delete Icerik")
                .blogCategoryDto(BlogCategoryDto.builder().blogCategoryId(1L).build())
                .build();

        MvcResult createResult = mockMvc.perform(post("/blog/api/v1.0.0/create")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newBlog)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode createNode = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long blogId = createNode.get("data").get("blogId").asLong();

        // 2. Blogu sil
        mockMvc.perform(delete("/blog/api/v1.0.0/delete/" + blogId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Normal GET sorgusunda bulunamamalı (Hibernate @SQLRestriction devrede)
        MvcResult notFoundResult = mockMvc.perform(get("/blog/api/v1.0.0/find/" + blogId))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode notFoundNode = objectMapper.readTree(notFoundResult.getResponse().getContentAsString());
        assertThat(notFoundNode.get("status").asText()).isEqualTo("ERROR");
        assertThat(notFoundNode.get("message").asText()).contains("bulunamadı");

        // 4. Veritabanında fiziksel olarak var olduğunu ve is_deleted = TRUE olduğunu doğrula
        Boolean isDeletedInDb = jdbcTemplate.queryForObject(
                "SELECT is_deleted FROM blogs WHERE blog_id = ?", Boolean.class, blogId);
        assertThat(isDeletedInDb).isTrue();

        Object deletedAt = jdbcTemplate.queryForObject(
                "SELECT deleted_at FROM blogs WHERE blog_id = ?", Object.class, blogId);
        assertThat(deletedAt).isNotNull();

        // 5. Admin silinmiş bloglar listesinde görmelidir
        MvcResult deletedListResult = mockMvc.perform(get("/blog/api/v1.0.0/deleted")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode deletedListNode = objectMapper.readTree(deletedListResult.getResponse().getContentAsString());
        assertThat(deletedListNode.get("data").isArray()).isTrue();

        // 6. Blogu geri yükle (Restore)
        MvcResult restoreResult = mockMvc.perform(post("/blog/api/v1.0.0/restore/" + blogId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode restoreNode = objectMapper.readTree(restoreResult.getResponse().getContentAsString());
        assertThat(restoreNode.get("data").get("isDeleted").asBoolean()).isFalse();

        // 7. Artık normal kullanıcılar tarafından tekrar erişilebilir olmalıdır
        MvcResult foundResult = mockMvc.perform(get("/blog/api/v1.0.0/find/" + blogId))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode foundNode = objectMapper.readTree(foundResult.getResponse().getContentAsString());
        assertThat(foundNode.get("status").asText()).isEqualTo("SUCCESS");
        assertThat(foundNode.get("data").get("blogId").asLong()).isEqualTo(blogId);
    }

    @Test
    @DisplayName("Yorum silindiğinde soft delete uygulanmalı ve geri yüklenebilmelidir")
    void testCommentSoftDeleteAndRestore() throws Exception {
        String token = getAdminToken();

        // 1. Blog 1 için yorum ekle
        CommentCreateRequestDto dto = CommentCreateRequestDto.builder()
                .content("Soft Delete Deneme Yorumu.")
                .build();

        MvcResult commentResult = mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode commentNode = objectMapper.readTree(commentResult.getResponse().getContentAsString());
        long commentId = commentNode.get("data").get("commentId").asLong();

        // 2. Yorumu sil
        mockMvc.perform(delete("/blog/api/v1.0.0/comments/" + commentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Veritabanında is_deleted = TRUE olmalı
        Boolean isDeletedInDb = jdbcTemplate.queryForObject(
                "SELECT is_deleted FROM comments WHERE comment_id = ?", Boolean.class, commentId);
        assertThat(isDeletedInDb).isTrue();

        // 4. Herkese açık yorum listesinde görünmemeli
        MvcResult publicComments = mockMvc.perform(get("/blog/api/v1.0.0/comments/1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode publicCommentsNode = objectMapper.readTree(publicComments.getResponse().getContentAsString());
        for (JsonNode item : publicCommentsNode.get("data")) {
            assertThat(item.get("commentId").asLong()).isNotEqualTo(commentId);
        }

        // 5. Admin yorumu geri yükler (Restore)
        mockMvc.perform(post("/blog/api/v1.0.0/comments/" + commentId + "/restore")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 6. Artık herkese açık listede tekrar görünmeli
        MvcResult restoredPublicComments = mockMvc.perform(get("/blog/api/v1.0.0/comments/1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode restoredNode = objectMapper.readTree(restoredPublicComments.getResponse().getContentAsString());
        boolean found = false;
        for (JsonNode item : restoredNode.get("data")) {
            if (item.get("commentId").asLong() == commentId) {
                found = true;
                break;
            }
        }
        assertThat(found).isTrue();
    }
}
