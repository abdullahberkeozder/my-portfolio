package com.berkeozder.controller.api.interfaces;

import com.berkeozder.error.ApiResult;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

/**
 * OAuth2 Sosyal Giriş REST API Sözleşmesi.
 *
 * @author Berke Özder
 */
public interface IOAuth2Api {

    /**
     * Ön yüz (React/Vue/Mobil) için aktif OAuth2 sağlayıcılarını ve giriş URL'lerini döner.
     */
    ResponseEntity<ApiResult<List<Map<String, String>>>> getOAuth2Providers();

    /**
     * OAuth2 başarılı yönlendirme geri çağırma (fallback) uç noktası.
     */
    ResponseEntity<ApiResult<Map<String, String>>> handleOAuth2Success(String token, String refreshToken);

    /**
     * OAuth2 başarısız yönlendirme geri çağırma (fallback) uç noktası.
     */
    ResponseEntity<ApiResult<Map<String, String>>> handleOAuth2Failure(String error);
}

