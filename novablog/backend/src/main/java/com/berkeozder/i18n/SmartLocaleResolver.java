package com.berkeozder.i18n;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.util.List;
import java.util.Locale;

/**
 * RESTful API ve modern SPA/Mobile istemciler için geliştirilmiş akıllı Locale Resolver.
 *
 * Çözümleme Öncelik Sırası:
 * 1. URL Query Parametresi: ?lang=tr, ?lang=en, ?lang=de
 * 2. HTTP Header: Accept-Language (tr-TR, en-US, de-DE, vb.)
 * 3. Fallback: Varsayılan Dil (Türkçe - tr_TR)
 *
 * @author Berke Özder
 */
public class SmartLocaleResolver extends AcceptHeaderLocaleResolver {

    public static final Locale LOCALE_TR = Locale.of("tr", "TR");
    public static final Locale LOCALE_EN = Locale.of("en", "US");
    public static final Locale LOCALE_DE = Locale.of("de", "DE");

    public static final List<Locale> SUPPORTED_LOCALES = List.of(
            LOCALE_TR,
            Locale.of("tr"),
            LOCALE_EN,
            Locale.of("en"),
            LOCALE_DE,
            Locale.of("de")
    );

    public SmartLocaleResolver() {
        super();
        setDefaultLocale(LOCALE_TR);
        setSupportedLocales(SUPPORTED_LOCALES);
    }

    @Override
    public Locale resolveLocale(HttpServletRequest request) {
        // 1. URL parametresi kontrolü (?lang=en, ?lang=de, ?lang=tr)
        String langParam = request.getParameter("lang");
        if (langParam != null && !langParam.isBlank()) {
            Locale matched = findSupportedLocale(langParam.trim());
            if (matched != null) {
                return matched;
            }
        }

        // 2. Accept-Language header kontrolü
        String acceptLanguage = request.getHeader("Accept-Language");
        if (acceptLanguage != null && !acceptLanguage.isBlank()) {
            try {
                List<Locale.LanguageRange> ranges = Locale.LanguageRange.parse(acceptLanguage);
                Locale matched = Locale.lookup(ranges, SUPPORTED_LOCALES);
                if (matched != null) {
                    return matched;
                }
            } catch (IllegalArgumentException ignored) {
                // Geçersiz veya bozuk header durumunda varsayılana düş
            }
        }

        // 3. Fallback varsayılan dil
        return getDefaultLocale() != null ? getDefaultLocale() : LOCALE_TR;
    }

    @Override
    public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
        // Stateless REST API'lerde setLocale çağrılarında UnsupportedOperationException oluşmasını engeller
    }

    private Locale findSupportedLocale(String lang) {
        for (Locale locale : SUPPORTED_LOCALES) {
            if (locale.getLanguage().equalsIgnoreCase(lang) || locale.toLanguageTag().equalsIgnoreCase(lang)) {
                return locale;
            }
        }
        return null;
    }
}

