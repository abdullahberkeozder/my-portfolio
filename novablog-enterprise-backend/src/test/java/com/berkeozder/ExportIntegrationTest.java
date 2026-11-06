package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.berkeozder.security.ratelimit.RateLimiterService;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ExportIntegrationTest {

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
                                .header("X-Forwarded-For", "192.168.100.1")
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
                                .username("exportuser_" + timestamp)
                                .email("export_" + timestamp + "@example.com")
                                .password("Password123")
                                .firstName("Export")
                                .lastName("User")
                                .build();

                MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                                .header("X-Forwarded-For", "192.168.100.2")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andReturn();

                JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
                return responseNode.get("data").get("accessToken").asText();
        }

        @Test
        @DisplayName("Admin kullanıcısı Excel (.xlsx) blog raporunu indirebilmelidir")
        void testExportExcel_WithAdminRole_ShouldReturn200AndAttachment() throws Exception {
                String adminToken = getAdminToken();

                MvcResult result = mockMvc.perform(get("/blog/api/v1.0.0/export/excel")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"blogs_report.xlsx\""))
                                .andExpect(header().string(HttpHeaders.CONTENT_TYPE,
                                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                                .andReturn();

                byte[] content = result.getResponse().getContentAsByteArray();
                assertThat(content).isNotEmpty();

                try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(content))) {
                        Sheet sheet = workbook.getSheet("Blog Raporu");
                        assertThat(sheet).isNotNull();
                        assertThat(sheet.getPhysicalNumberOfRows()).isGreaterThanOrEqualTo(1); // En azından header
                                                                                               // satırı mevcut
                }
        }

        @Test
        @DisplayName("Admin kullanıcısı UTF-8 BOM destekli CSV blog raporunu indirebilmelidir")
        void testExportCsv_WithAdminRole_ShouldReturn200AndUtf8BomCsv() throws Exception {
                String adminToken = getAdminToken();

                MvcResult result = mockMvc.perform(get("/blog/api/v1.0.0/export/csv")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                                                "attachment; filename=\"blogs_report.csv\""))
                                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, containsString("text/csv")))
                                .andReturn();

                byte[] content = result.getResponse().getContentAsByteArray();
                assertThat(content.length).isGreaterThan(3);

                // UTF-8 BOM (0xEF, 0xBB, 0xBF) kontrolü
                assertThat(content[0]).isEqualTo((byte) 0xEF);
                assertThat(content[1]).isEqualTo((byte) 0xBB);
                assertThat(content[2]).isEqualTo((byte) 0xBF);

                String csvString = new String(content, 3, content.length - 3, StandardCharsets.UTF_8);
                assertThat(csvString).contains(
                                "ID,Başlık,Alt Başlık,Kategori,Yazar,Yorum Sayısı,Etiketler,Oluşturulma Tarihi,Durum");
        }

        @Test
        @DisplayName("Giriş yapmamış kullanıcı Excel export uç noktasına erişememelidir (401 veya 403)")
        void testExportExcel_WithoutAuthentication_ShouldReturn401Or403() throws Exception {
                mockMvc.perform(get("/blog/api/v1.0.0/export/excel"))
                                .andExpect(status().is4xxClientError());
        }

        @Test
        @DisplayName("Normal kullanıcı (ROLE_USER) admin gerektiren export uç noktasına erişememelidir (403 Forbidden)")
        void testExportExcel_WithRegularUserRole_ShouldReturn403Forbidden() throws Exception {
                String userToken = getUserToken();

                mockMvc.perform(get("/blog/api/v1.0.0/export/excel")
                                .header("Authorization", "Bearer " + userToken))
                                .andExpect(status().isForbidden());
        }
}
