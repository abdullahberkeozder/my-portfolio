package com.berkeozder;

import com.berkeozder.business.dto.auth.LoginRequestDto;
import com.berkeozder.business.dto.auth.RefreshTokenRequestDto;
import com.berkeozder.business.dto.auth.RegisterRequestDto;
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
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Başarılı kullanıcı kaydı testi (POST /api/v1/auth/register)")
    void testRegisterSuccess() throws Exception {
        RegisterRequestDto request = RegisterRequestDto.builder()
                .username("testuser_" + System.currentTimeMillis())
                .email("test_" + System.currentTimeMillis() + "@berkeozder.com")
                .password("Password123")
                .firstName("Test")
                .lastName("User")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(responseNode.get("data").get("accessToken").asText()).isNotEmpty();
        assertThat(responseNode.get("data").get("tokenType").asText()).isEqualTo("Bearer");
    }

    @Test
    @DisplayName("Başarılı admin girişi testi (POST /api/v1/auth/login)")
    void testLoginSuccess() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("root")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode responseNode = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(responseNode.get("data").get("accessToken").asText()).isNotEmpty();
        assertThat(responseNode.get("data").get("username").asText()).isEqualTo("admin");
    }

    @Test
    @DisplayName("Hatalı şifre ile giriş denemesi testi (POST /api/v1/auth/login)")
    void testLoginInvalidPassword() throws Exception {
        LoginRequestDto request = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("JWT ile korunan /me endpoint'ine erişim testi (GET /api/v1/auth/me)")
    void testProtectedMeEndpointWithJwt() throws Exception {
        // 1. Giriş yapıp token al
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .usernameOrEmail("admin")
                .password("root")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = loginNode.get("data").get("accessToken").asText();

        // 2. Token ile /me çağrısı yap
        MvcResult meResult = mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode meNode = objectMapper.readTree(meResult.getResponse().getContentAsString());
        assertThat(meNode.get("data").get("username").asText()).isEqualTo("admin");
    }

    @Test
    @DisplayName("Refresh Token ile yeni Access Token alma testi (POST /api/v1/auth/refresh-token)")
    void testRefreshToken() throws Exception {
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .usernameOrEmail("superadmin")
                .password("root")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode loginNode = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String refreshToken = loginNode.get("data").get("refreshToken").asText();

        // Refresh token ile yeni token iste
        RefreshTokenRequestDto refreshRequest = RefreshTokenRequestDto.builder()
                .refreshToken(refreshToken)
                .build();

        MvcResult refreshResult = mockMvc.perform(post("/api/v1/auth/refresh-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshRequest)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode refreshNode = objectMapper.readTree(refreshResult.getResponse().getContentAsString());
        assertThat(refreshNode.get("data").get("accessToken").asText()).isNotEmpty();
    }
}

