package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class BlogSearchIntegrationTest {

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
    @DisplayName("Genel anahtar kelime araması ile blog bulma testi")
    void testSearchByKeyword() throws Exception {
        // Runner tarafından oluşturulan 'Header-1' aranır
        MvcResult result = mockMvc.perform(get("/blog/api/v1.0.0/search")
                        .param("search", "Header-1"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(responseNode.get("status").asText()).isEqualTo("SUCCESS");

        JsonNode pagedData = responseNode.get("data");
        assertThat(pagedData.get("totalElements").asLong()).isGreaterThanOrEqualTo(1);
        assertThat(pagedData.get("content").isArray()).isTrue();
        assertThat(pagedData.get("content").get(0).get("header").asText()).contains("Header-1");
    }

    @Test
    @DisplayName("Eşleşmeyen arama sorgusunda boş sonuç dönmelidir")
    void testSearchByNonExistentKeyword() throws Exception {
        MvcResult result = mockMvc.perform(get("/blog/api/v1.0.0/search")
                        .param("search", "X9Y8Z7NonExistentSearchTerm"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode pagedData = responseNode.get("data");
        assertThat(pagedData.get("totalElements").asLong()).isEqualTo(0);
        assertThat(pagedData.get("content").size()).isEqualTo(0);
    }

    @Test
    @DisplayName("Gelişmiş sayfalama ve sıralama testi")
    void testSearchPaginationAndSorting() throws Exception {
        MvcResult result = mockMvc.perform(get("/blog/api/v1.0.0/search")
                        .param("page", "0")
                        .param("size", "2")
                        .param("sort_by", "blogId")
                        .param("sort_dir", "asc"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        JsonNode pagedData = responseNode.get("data");

        assertThat(pagedData.get("pageNumber").asInt()).isEqualTo(0);
        assertThat(pagedData.get("pageSize").asInt()).isEqualTo(2);
        assertThat(pagedData.get("isFirst").asBoolean()).isTrue();
        assertThat(pagedData.get("content").isArray()).isTrue();
    }

    @Test
    @DisplayName("Etikete göre filtreleme testi")
    void testSearchByTag() throws Exception {
        String token = getAdminToken();

        // 1. Yeni etiket oluştur
        TagDto tagDto = TagDto.builder().name("search-test-tag").build();
        mockMvc.perform(post("/blog/api/v1.0.0/tags")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tagDto)))
                .andExpect(status().isCreated());

        // 2. Blog (ID: 1) için bu etiketi ekle
        mockMvc.perform(post("/blog/api/v1.0.0/tags/1/search-test-tag")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // 3. Search endpoint'i üzerinden tag parametresiyle filtrele
        MvcResult searchResult = mockMvc.perform(get("/blog/api/v1.0.0/search")
                        .param("tag", "search-test-tag"))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(searchResult.getResponse().getContentAsString());
        JsonNode pagedData = responseNode.get("data");

        assertThat(pagedData.get("totalElements").asLong()).isGreaterThanOrEqualTo(1);
    }
}
