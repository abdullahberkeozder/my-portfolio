package com.berkeozder;

import com.berkeozder.security.jwt.JwtTokenProvider;
import com.berkeozder.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.berkeozder.security.oauth2.OAuth2AuthenticationSuccessHandler;
import com.berkeozder.security.ratelimit.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("OAuth2 & Social Login Integration Tests")
class OAuth2IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OAuth2AuthenticationSuccessHandler successHandler;

    @Autowired
    private OAuth2AuthenticationFailureHandler failureHandler;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired(required = false)
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        if (rateLimiterService != null) {
            rateLimiterService.resetBuckets();
        }
    }

    @Test
    @DisplayName("1. Sağlayıcı Listesi: GET /api/v1/auth/oauth2/providers Google ve GitHub dönmelidir")
    void shouldReturnOAuth2Providers() throws Exception {
        mockMvc.perform(get("/api/v1/auth/oauth2/providers")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data[0].id").value("google"))
                .andExpect(jsonPath("$.data[0].authorizationUrl").value("/oauth2/authorization/google"))
                .andExpect(jsonPath("$.data[1].id").value("github"))
                .andExpect(jsonPath("$.data[1].authorizationUrl").value("/oauth2/authorization/github"));
    }

    @Test
    @DisplayName("2. Başarılı Callback API: GET /api/v1/auth/oauth2/success token bilgilerini döner")
    void shouldHandleOAuth2SuccessEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/auth/oauth2/success")
                        .param("token", "dummy.jwt.token")
                        .param("refreshToken", "dummy.refresh.token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.token").value("dummy.jwt.token"))
                .andExpect(jsonPath("$.data.refreshToken").value("dummy.refresh.token"));
    }

    @Test
    @DisplayName("3. Hata Callback API: GET /api/v1/auth/oauth2/failure hata mesajını döner")
    void shouldHandleOAuth2FailureEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/auth/oauth2/failure")
                        .param("error", "Kullanıcı işlemi iptal etti")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ERROR"))
                .andExpect(jsonPath("$.error").value("OAUTH2_ERROR"));
    }

    @Test
    @DisplayName("4. SuccessHandler: Başarılı OAuth2 girişinde JWT üretip yönlendirmelidir")
    void shouldGenerateTokensAndRedirectOnSuccess() throws Exception {
        UserDetails userDetails = new User("oauth_tester", "pwd", List.of(new SimpleGrantedAuthority("ROLE_USER")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        successHandler.onAuthenticationSuccess(request, response, auth);

        String redirectedUrl = response.getRedirectedUrl();
        assertThat(redirectedUrl).isNotNull();
        assertThat(redirectedUrl).contains("token=");
        assertThat(redirectedUrl).contains("refreshToken=");

        // Üretilen token'ı doğrula
        String token = redirectedUrl.split("token=")[1].split("&")[0];
        assertThat(jwtTokenProvider.validateToken(token)).isTrue();
        assertThat(jwtTokenProvider.getUsernameFromJwt(token)).isEqualTo("oauth_tester");
    }

    @Test
    @DisplayName("5. FailureHandler: Başarısız OAuth2 girişinde hata parametresiyle yönlendirmelidir")
    void shouldRedirectWithErrorOnFailure() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        OAuth2AuthenticationException exception = new OAuth2AuthenticationException(new OAuth2Error("access_denied", "Yetki reddedildi", null));

        failureHandler.onAuthenticationFailure(request, response, exception);

        String redirectedUrl = response.getRedirectedUrl();
        assertThat(redirectedUrl).isNotNull();
        assertThat(redirectedUrl).contains("error=");
    }

    @Test
    @DisplayName("6. OAuth2 Yetkilendirme Başlatma: /oauth2/authorization/google 302 yönlendirmesi dönmelidir")
    void shouldRedirectToGoogleAuthorizationServer() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/google"))
                .andExpect(status().is3xxRedirection());
    }

    @Test
    @DisplayName("7. OAuth2 Yetkilendirme Başlatma: /oauth2/authorization/github 302 yönlendirmesi dönmelidir")
    void shouldRedirectToGithubAuthorizationServer() throws Exception {
        mockMvc.perform(get("/oauth2/authorization/github"))
                .andExpect(status().is3xxRedirection());
    }
}
