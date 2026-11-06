package com.berkeozder.controller.api.impl;

import com.berkeozder.controller.api.interfaces.II18nApi;
import com.berkeozder.i18n.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Çoklu Dil ve Yerelleştirme (i18n) REST API Controller.
 *
 * Accept-Language header veya ?lang= sorgu parametresi üzerinden aktif dili belirler,
 * frontend için sözlük ve aktif dil bilgilerini sunar.
 *
 * @author Berke Özder
 */
@Log4j2
@RestController
@RequestMapping("/api/v1/i18n")
@RequiredArgsConstructor
@CrossOrigin
@Tag(name = "Internationalization (i18n) API", description = "Çoklu dil ve yerelleştirme yönetimi")
public class I18nApiImpl implements II18nApi {

    private final MessageService messageService;

    @Override
    @GetMapping("/current")
    @Operation(summary = "Aktif dil ve yerelleştirme bilgisi", description = "Mevcut istekteki Accept-Language veya ?lang parametresine göre çözümlenen aktif dili ve örnek çevirileri döner.")
    public ResponseEntity<Map<String, Object>> getCurrentLocaleInfo() {
        Locale current = messageService.getCurrentLocale();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("language", current.getLanguage());
        response.put("country", current.getCountry());
        response.put("tag", current.toLanguageTag());
        response.put("displayName", current.getDisplayName(current));

        Map<String, String> samples = new LinkedHashMap<>();
        samples.put("general.success", messageService.getMessage("general.success"));
        samples.put("general.error", messageService.getMessage("general.error"));
        samples.put("blog.not.found", messageService.getMessage("blog.not.found", 42));
        samples.put("auth.login.success", messageService.getMessage("auth.login.success", "Berke"));
        samples.put("rate.limit.exceeded", messageService.getMessage("rate.limit.exceeded", 60));
        samples.put("bulk.operation.success", messageService.getMessage("bulk.operation.success", 5, "SOFT_DELETE"));

        response.put("samples", samples);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/languages")
    @Operation(summary = "Desteklenen diller listesi", description = "Sistem tarafından desteklenen dillerin kod, isim ve bayrak listesini döner.")
    public ResponseEntity<List<Map<String, String>>> getSupportedLanguages() {
        List<Map<String, String>> languages = List.of(
                Map.of("code", "tr", "name", "Türkçe", "country", "TR", "flag", "🇹🇷"),
                Map.of("code", "en", "name", "English", "country", "US", "flag", "🇺🇸"),
                Map.of("code", "de", "name", "Deutsch", "country", "DE", "flag", "🇩🇪")
        );
        return ResponseEntity.ok(languages);
    }

    @Override
    @GetMapping("/messages")
    @Operation(summary = "Frontend sözlük anahtarları", description = "Ön yüz uygulamaları (SPA) için aktif dildeki tüm çeviri sözlüğünü döner.")
    public ResponseEntity<Map<String, String>> getAllMessages() {
        List<String> keys = List.of(
                "general.success",
                "general.error",
                "general.not.found",
                "general.unauthorized",
                "general.forbidden",
                "blog.not.found",
                "blog.created.success",
                "blog.updated.success",
                "blog.deleted.success",
                "blog.restored.success",
                "category.not.found",
                "category.created.success",
                "comment.not.found",
                "comment.created.success",
                "comment.deleted.success",
                "auth.login.success",
                "auth.login.failed",
                "auth.register.success",
                "auth.token.expired",
                "rate.limit.exceeded",
                "bulk.operation.success"
        );

        Map<String, String> dict = new LinkedHashMap<>();
        for (String key : keys) {
            dict.put(key, messageService.getMessage(key));
        }

        return ResponseEntity.ok(dict);
    }
}

