package com.berkeozder.security.oauth2.user;

import java.util.Map;

/**
 * GitHub OAuth2 profil öznitelik çözümleyicisi.
 *
 * @author Berke Özder
 */
public class GithubOAuth2UserInfo extends OAuth2UserInfo {

    public GithubOAuth2UserInfo(Map<String, Object> attributes) {
        super(attributes);
    }

    @Override
    public String getId() {
        Object id = attributes.get("id");
        return id != null ? String.valueOf(id) : null;
    }

    @Override
    public String getName() {
        String name = (String) attributes.get("name");
        return (name != null && !name.isBlank()) ? name : (String) attributes.get("login");
    }

    @Override
    public String getEmail() {
        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            // GitHub profili e-postayı gizlediyse tekil sahte e-posta adresi türetilir
            return attributes.get("login") + "@github.oauth.local";
        }
        return email;
    }

    @Override
    public String getImageUrl() {
        return (String) attributes.get("avatar_url");
    }
}

