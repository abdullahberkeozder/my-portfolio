package com.berkeozder.security.oauth2.user;

import java.util.Map;

/**
 * Harici OAuth2 sağlayıcılarından (Google, GitHub vb.) dönen kullanıcı özniteliklerini
 * standartlaştıran temel soyut sınıf.
 *
 * @author Berke Özder
 */
public abstract class OAuth2UserInfo {

    protected Map<String, Object> attributes;

    public OAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    public Map<String, Object> getAttributes() {
        return attributes;
    }

    public abstract String getId();

    public abstract String getName();

    public abstract String getEmail();

    public abstract String getImageUrl();
}

