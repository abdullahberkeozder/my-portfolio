package com.berkeozder.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

/**
 * OAuth2 kimlik doğrulaması başarısız olduğunda veya iptal edildiğinde çalışan işleyici.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${app.oauth2.failure-redirect-uri:http://localhost:3000/oauth2/redirect?error=true}")
    private String failureRedirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        String targetUrl = UriComponentsBuilder.fromUriString(failureRedirectUri)
                .queryParam("error", exception.getLocalizedMessage())
                .build().toUriString();

        log.error("OAuth2 Kimlik Doğrulama Hatası: {}", exception.getMessage());
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}

