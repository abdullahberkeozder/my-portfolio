package com.berkeozder.security.oauth2.user;

import com.berkeozder.security.oauth2.AuthProvider;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

import java.util.Map;

/**
 * Sağlayıcı adına (registrationId) göre uygun OAuth2UserInfo nesnesini üreten fabrika.
 *
 * @author Berke Özder
 */
public class OAuth2UserInfoFactory {

    public static OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if (registrationId.equalsIgnoreCase(AuthProvider.GOOGLE.name())) {
            return new GoogleOAuth2UserInfo(attributes);
        } else if (registrationId.equalsIgnoreCase(AuthProvider.GITHUB.name())) {
            return new GithubOAuth2UserInfo(attributes);
        } else {
            throw new OAuth2AuthenticationException(new OAuth2Error("unsupported_provider",
                    "Desteklenmeyen OAuth2 sağlayıcısı: " + registrationId, null));
        }
    }
}

