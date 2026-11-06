package com.berkeozder;

import com.berkeozder.security.ratelimit.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Internationalization (i18n) Integration Tests")
class I18nIntegrationTest {

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
    @DisplayName("1. Varsayılan Dil: Header veya parametre verilmediğinde Türkçe (tr) dönmelidir")
    void testGetDefaultLocale_ShouldReturnTurkish() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/current")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("tr"))
                .andExpect(jsonPath("$.samples['general.success']").value("İşlem başarıyla tamamlandı."))
                .andExpect(jsonPath("$.samples['blog.not.found']").value("Blog bulunamadı. ID: 42"));
    }

    @Test
    @DisplayName("2. Accept-Language Header: 'en-US' gönderildiğinde İngilizce yanıt dönmelidir")
    void testGetLocale_WithAcceptLanguageEn_ShouldReturnEnglish() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/current")
                        .header("Accept-Language", "en-US,en;q=0.9")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.samples['general.success']").value("Operation completed successfully."))
                .andExpect(jsonPath("$.samples['blog.not.found']").value("Blog not found. ID: 42"));
    }

    @Test
    @DisplayName("3. Accept-Language Header: 'de-DE' gönderildiğinde Almanca yanıt dönmelidir")
    void testGetLocale_WithAcceptLanguageDe_ShouldReturnGerman() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/current")
                        .header("Accept-Language", "de-DE,de;q=0.9")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("de"))
                .andExpect(jsonPath("$.samples['general.success']").value("Vorgang erfolgreich abgeschlossen."))
                .andExpect(jsonPath("$.samples['blog.not.found']").value("Blog nicht gefunden. ID: 42"));
    }

    @Test
    @DisplayName("4. URL Sorgu Parametresi: ?lang=en gönderildiğinde İngilizceye geçmelidir")
    void testGetLocale_WithQueryParamEn_ShouldReturnEnglish() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/current")
                        .param("lang", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("en"))
                .andExpect(jsonPath("$.samples['general.success']").value("Operation completed successfully."));
    }

    @Test
    @DisplayName("5. URL Sorgu Parametresi: ?lang=de gönderildiğinde Almancaya geçmelidir")
    void testGetLocale_WithQueryParamDe_ShouldReturnGerman() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/current")
                        .param("lang", "de")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.language").value("de"))
                .andExpect(jsonPath("$.samples['general.success']").value("Vorgang erfolgreich abgeschlossen."));
    }

    @Test
    @DisplayName("6. Desteklenen Diller: GET /api/v1/i18n/languages TR, EN ve DE listelemelidir")
    void testGetSupportedLanguages() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/languages")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("tr"))
                .andExpect(jsonPath("$[0].name").value("Türkçe"))
                .andExpect(jsonPath("$[1].code").value("en"))
                .andExpect(jsonPath("$[1].name").value("English"))
                .andExpect(jsonPath("$[2].code").value("de"))
                .andExpect(jsonPath("$[2].name").value("Deutsch"));
    }

    @Test
    @DisplayName("7. Frontend Sözlük Sözlüğü: GET /api/v1/i18n/messages aktif dile ait anahtarları dönmelidir")
    void testGetAllMessages_WithEnglishParam() throws Exception {
        mockMvc.perform(get("/api/v1/i18n/messages")
                        .param("lang", "en")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$['general.success']").value("Operation completed successfully."))
                .andExpect(jsonPath("$['general.error']").value("An error occurred."))
                .andExpect(jsonPath("$['auth.register.success']").value("Registration completed successfully."));
    }
}

