package com.berkeozder.controller.api.interfaces;

import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

/**
 * Internationalization (i18n) REST API sözleşmesi.
 *
 * @author Berke Özder
 */
public interface II18nApi {

    /**
     * O anki isteğin aktif Locale bilgisini ve örnek mesajları döner.
     */
    ResponseEntity<Map<String, Object>> getCurrentLocaleInfo();

    /**
     * Desteklenen tüm dillerin listesini döner.
     */
    ResponseEntity<List<Map<String, String>>> getSupportedLanguages();

    /**
     * Frontend uygulamaları için aktif dildeki anahtar-değer sözlüğünü döner.
     */
    ResponseEntity<Map<String, String>> getAllMessages();
}

