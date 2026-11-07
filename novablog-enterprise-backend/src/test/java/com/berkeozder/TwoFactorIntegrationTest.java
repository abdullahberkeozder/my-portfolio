package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
import com.berkeozder.business.dto.twofactor.TwoFactorVerifyRequestDto;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.berkeozder.security.twofactor.TotpService;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("Two-Factor Authentication (2FA) End-to-End Integration Tests")
class TwoFactorIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TotpService totpService;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }
    }

    private String registerAndGetToken(String username, String email) throws Exception {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .username(username)
                .email(email)
                .password("Password123")
                .firstName("TwoFactor")
                .lastName("Tester")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .header("X-Forwarded-For", "192.168.210.1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode node = objectMapper.readTree(result.getResponse().getContentAsString());
        return node.get("data").get("accessToken").asText();
    }

    @Test
    @DisplayName("1. Yetkisiz Erişim: Oturum açılmadan /setup çağrıldığında 401 dönmelidir")
    void shouldDenySetupWithoutAuth() throws Exception {
        mockMvc.perform(post("/api/v1/auth/2fa/setup")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("2. Tam Uçtan Uca 2FA Yaşam Döngüsü (Setup -> Enable -> 2FA Login -> Verify -> Disable)")
    void shouldCompleteFull2faLifecycle() throws Exception {
        long ts = System.currentTimeMillis();
        String username = "user2fa_" + ts;
        String email = "user2fa_" + ts + "@example.com";
        String token = registerAndGetToken(username, email);

        // A) 2FA Kurulumu Başlat (/setup)
        MvcResult setupResult = mockMvc.perform(post("/api/v1/auth/2fa/setup")
                        .header("Authorization", "Bearer " + token)
                        .header("X-Forwarded-For", "192.168.210.2")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.secret").exists())
                .andExpect(jsonPath("$.data.qrCodeDataUri").exists())
                .andReturn();

        JsonNode setupNode = objectMapper.readTree(setupResult.getResponse().getContentAsString());
        String secret = setupNode.get("data").get("secret").asText();
        assertThat(secret).hasSize(32);

        // B) 2FA'yı Aktif Et (/enable)
        long currentInterval = System.currentTimeMillis() / 1000 / 30;
        String validCode = totpService.generateCodeForTime(secret, currentInterval);

        TwoFactorVerifyRequestDto enableRequest = TwoFactorVerifyRequestDto.builder()
                .code(validCode)
                .build();

        MvcResult enableResult = mockMvc.perform(post("/api/v1/auth/2fa/enable")
                        .header("Authorization", "Bearer " + token)
                        .header("X-Forwarded-For", "192.168.210.3")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(enableRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.recoveryCodes").isArray())
                .andReturn();

        JsonNode enableNode = objectMapper.readTree(enableResult.getResponse().getContentAsString());
        assertThat(enableNode.get("data").get("recoveryCodes")).hasSize(8);

        // C) 2FA Durumunu Kontrol Et (/status)
        mockMvc.perform(get("/api/v1/auth/2fa/status")
                        .header("Authorization", "Bearer " + token)
                        .header("X-Forwarded-For", "192.168.210.4")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.2faEnabled").value(true))
                .andExpect(jsonPath("$.data.remainingBackupCodes").value(8));

        // D) Kullanıcı Parola ile Giriş Yapar (2FA Zorunlu Olmalıdır)
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .usernameOrEmail(username)
                .password("Password123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "192.168.210.5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.2faRequired").value(true))
                .andExpect(jsonPath("$.data.preAuthToken").exists())
                .andExpect(jsonPath("$.data.accessToken").doesNotExist())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String preAuthToken = loginNode.get("data").get("preAuthToken").asText();

        // E) Yanlış 2FA Kodu ile Giriş Denemesi -> 400 Bad Request
        TwoFactorVerifyRequestDto invalidVerifyRequest = TwoFactorVerifyRequestDto.builder()
                .preAuthToken(preAuthToken)
                .code("000000")
                .build();

        mockMvc.perform(post("/api/v1/auth/2fa/verify-login")
                        .header("X-Forwarded-For", "192.168.210.6")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidVerifyRequest)))
                .andExpect(status().isBadRequest());

        // F) Doğru 2FA Kodu ile Giriş -> Tam JWT Verilmelidir
        currentInterval = System.currentTimeMillis() / 1000 / 30;
        String loginCode = totpService.generateCodeForTime(secret, currentInterval);

        TwoFactorVerifyRequestDto validVerifyRequest = TwoFactorVerifyRequestDto.builder()
                .preAuthToken(preAuthToken)
                .code(loginCode)
                .build();

        MvcResult verifyResult = mockMvc.perform(post("/api/v1/auth/2fa/verify-login")
                        .header("X-Forwarded-For", "192.168.210.7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validVerifyRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").exists())
                .andExpect(jsonPath("$.data.2faRequired").value(false))
                .andReturn();

        JsonNode verifyNode = objectMapper.readTree(verifyResult.getResponse().getContentAsString());
        String fullAccessToken = verifyNode.get("data").get("accessToken").asText();

        // G) 2FA Devre Dışı Bırakma (/disable)
        currentInterval = System.currentTimeMillis() / 1000 / 30;
        String disableCode = totpService.generateCodeForTime(secret, currentInterval);

        TwoFactorVerifyRequestDto disableRequest = TwoFactorVerifyRequestDto.builder()
                .code(disableCode)
                .build();

        mockMvc.perform(post("/api/v1/auth/2fa/disable")
                        .header("Authorization", "Bearer " + fullAccessToken)
                        .header("X-Forwarded-For", "192.168.210.8")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(disableRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        // H) Durumun is2faEnabled=false olduğunu doğrula
        mockMvc.perform(get("/api/v1/auth/2fa/status")
                        .header("Authorization", "Bearer " + fullAccessToken)
                        .header("X-Forwarded-For", "192.168.210.9")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.2faEnabled").value(false));
    }
}

