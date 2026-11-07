package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.comment.CommentCreateRequestDto;
import com.berkeozder.business.dto.tag.TagDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class CommentTagIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    @DisplayName("Admin ile etiket oluşturma ve bloga bağlama testi")
    void testCreateTagAndAssignToBlog() throws Exception {
        String token = getAdminToken();

        // 1. Yeni etiket oluştur
        TagDto tagDto = TagDto.builder().name("java-2026").build();
        MvcResult tagResult = mockMvc.perform(post("/blog/api/v1.0.0/tags")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tagDto)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode tagNode = objectMapper.readTree(tagResult.getResponse().getContentAsString());
        assertThat(tagNode.get("data").get("name").asText()).isEqualTo("java-2026");

        // 2. Blog (ID: 1) için bu etiketi ekle
        mockMvc.perform(post("/blog/api/v1.0.0/tags/1/java-2026")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Etikete göre blogları getir
        MvcResult blogsResult = mockMvc.perform(get("/blog/api/v1.0.0/tags/java-2026/blogs"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode blogsNode = objectMapper.readTree(blogsResult.getResponse().getContentAsString());
        assertThat(blogsNode.get("data").isArray()).isTrue();
    }

    @Test
    @DisplayName("Giriş yapmış kullanıcı ile blog yazısına yorum ekleme testi")
    void testAddCommentWithJwt() throws Exception {
        String token = getAdminToken();

        CommentCreateRequestDto commentRequest = CommentCreateRequestDto.builder()
                .content("Harika ve detaylı bir mimari içerik, tebrikler!")
                .build();

        MvcResult commentResult = mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode commentNode = objectMapper.readTree(commentResult.getResponse().getContentAsString());
        assertThat(commentNode.get("data").get("content").asText()).contains("Harika ve detaylı");
        assertThat(commentNode.get("data").get("username").asText()).isEqualTo("admin");
    }

    @Test
    @DisplayName("Giriş yapmadan yorum ekleme denemesi 401 dönmelidir")
    void testAddCommentWithoutJwtUnauthorized() throws Exception {
        CommentCreateRequestDto commentRequest = CommentCreateRequestDto.builder()
                .content("Yetkisiz anonim yorum denemesi.")
                .build();

        mockMvc.perform(post("/blog/api/v1.0.0/comments/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Blog yazısına ait yorumları herkese açık listeleme testi")
    void testGetCommentsForBlog() throws Exception {
        mockMvc.perform(get("/blog/api/v1.0.0/comments/1"))
                .andExpect(status().isOk());
    }
}

