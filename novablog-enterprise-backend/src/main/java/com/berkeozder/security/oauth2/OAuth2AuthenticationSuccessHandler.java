package com.berkeozder.security.oauth2;

import com.berkeozder.security.jwt.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 kimlik doğrulaması başarılı olduğunda çalışan işleyici.
 * JWT erişim ve yenileme belirteçlerini üreterek yapılandırılan ön yüz yönlendirme adresine aktarır.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        String token = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication.getName());

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        log.info("OAuth2 Başarılı Giriş -> Kullanıcı: {}, Yönlendirilen Hedef: {}", authentication.getName(), targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

