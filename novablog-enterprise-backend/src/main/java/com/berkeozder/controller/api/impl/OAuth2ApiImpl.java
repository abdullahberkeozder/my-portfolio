package com.berkeozder.controller.api.impl;

import com.berkeozder.controller.api.interfaces.IOAuth2Api;
import com.berkeozder.error.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * OAuth2 Sosyal Giriş REST API Controller.
 *
 * @author Berke Özder
 */
@Log4j2
@RestController
@RequestMapping("/api/v1/auth/oauth2")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "OAuth2 Social Login API", description = "Google ve GitHub ile sosyal giriş yönetimi")
public class OAuth2ApiImpl implements IOAuth2Api {

    @Override
    @GetMapping("/providers")
    @Operation(summary = "Aktif OAuth2 Sağlayıcıları", description = "Ön yüzün giriş butonlarında kullanabilmesi için sağlayıcı listesini ve yetkilendirme linklerini döner.")
    public ResponseEntity<ApiResult<List<Map<String, String>>>> getOAuth2Providers() {
        List<Map<String, String>> providers = List.of(
                Map.of(
                        "id", "google",
                        "name", "Google",
                        "authorizationUrl", "/oauth2/authorization/google",
                        "icon", "google"
                ),
                Map.of(
                        "id", "github",
                        "name", "GitHub",
                        "authorizationUrl", "/oauth2/authorization/github",
                        "icon", "github"
                )
        );
        return ResponseEntity.ok(ApiResult.success(providers));
    }

    @Override
    @GetMapping("/success")
    @Operation(summary = "OAuth2 Başarılı Yönlendirme", description = "Sosyal giriş başarılı olduğunda dönülen token bilgilerini onaylar.")
    public ResponseEntity<ApiResult<Map<String, String>>> handleOAuth2Success(
            @RequestParam(name = "token", required = false) String token,
            @RequestParam(name = "refreshToken", required = false) String refreshToken
    ) {
        Map<String, String> response = Map.of(
                "token", token != null ? token : "",
                "refreshToken", refreshToken != null ? refreshToken : "",
                "message", "OAuth2 girişi başarıyla tamamlandı."
        );
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @GetMapping("/failure")
    @Operation(summary = "OAuth2 Hata Yönlendirmesi", description = "Sosyal giriş başarısız olduğunda dönülen hata bilgisini gösterir.")
    public ResponseEntity<ApiResult<Map<String, String>>> handleOAuth2Failure(
            @RequestParam(name = "error", required = false) String error
    ) {
        Map<String, String> response = Map.of(
                "error", error != null ? error : "OAuth2 kimlik doğrulama başarısız oldu."
        );
        return ResponseEntity.ok(ApiResult.error("OAUTH2_ERROR", error, "/api/v1/auth/oauth2/failure"));
    }
}

