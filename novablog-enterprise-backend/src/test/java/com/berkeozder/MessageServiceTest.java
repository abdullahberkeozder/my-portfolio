package com.berkeozder;

import com.berkeozder.config.I18nConfig;
import com.berkeozder.i18n.MessageService;
import com.berkeozder.i18n.SmartLocaleResolver;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Locale;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(classes = {I18nConfig.class, MessageService.class})
@ActiveProfiles("test")
@DisplayName("MessageService Unit & Localization Tests")
class MessageServiceTest {

    @Autowired
    private MessageService messageService;

    @Test
    @DisplayName("1. Türkçe mesaj çözümleme ve parametre interpolation testi")
    void shouldResolveTurkishMessages() {
        String successMsg = messageService.getMessage("general.success", SmartLocaleResolver.LOCALE_TR);
        assertThat(successMsg).isEqualTo("İşlem başarıyla tamamlandı.");

        String blogNotFoundMsg = messageService.getMessage("blog.not.found", SmartLocaleResolver.LOCALE_TR, 101L);
        assertThat(blogNotFoundMsg).isEqualTo("Blog bulunamadı. ID: 101");

        String bulkMsg = messageService.getMessage("bulk.operation.success", SmartLocaleResolver.LOCALE_TR, 5, "SOFT_DELETE");
        assertThat(bulkMsg).isEqualTo("5 adet blog üzerinde SOFT_DELETE işlemi başarıyla uygulandı.");
    }

    @Test
    @DisplayName("2. İngilizce mesaj çözümleme testi")
    void shouldResolveEnglishMessages() {
        String successMsg = messageService.getMessage("general.success", SmartLocaleResolver.LOCALE_EN);
        assertThat(successMsg).isEqualTo("Operation completed successfully.");

        String blogNotFoundMsg = messageService.getMessage("blog.not.found", SmartLocaleResolver.LOCALE_EN, 202L);
        assertThat(blogNotFoundMsg).isEqualTo("Blog not found. ID: 202");

        String authMsg = messageService.getMessage("auth.login.success", SmartLocaleResolver.LOCALE_EN, "Berke");
        assertThat(authMsg).isEqualTo("Login successful. Welcome, Berke!");
    }

    @Test
    @DisplayName("3. Almanca mesaj çözümleme testi")
    void shouldResolveGermanMessages() {
        String successMsg = messageService.getMessage("general.success", SmartLocaleResolver.LOCALE_DE);
        assertThat(successMsg).isEqualTo("Vorgang erfolgreich abgeschlossen.");

        String blogNotFoundMsg = messageService.getMessage("blog.not.found", SmartLocaleResolver.LOCALE_DE, 303L);
        assertThat(blogNotFoundMsg).isEqualTo("Blog nicht gefunden. ID: 303");

        String rateLimitMsg = messageService.getMessage("rate.limit.exceeded", SmartLocaleResolver.LOCALE_DE, 45);
        assertThat(rateLimitMsg).isEqualTo("Zu viele Anfragen. Bitte versuchen Sie es nach 45 Sekunden erneut.");
    }

    @Test
    @DisplayName("4. Bulunamayan anahtar durumunda fallback davranışı")
    void shouldFallbackWhenKeyNotFound() {
        String unknownKey = "non.existing.key.code";
        String resolved = messageService.getMessage(unknownKey, SmartLocaleResolver.LOCALE_TR);
        assertThat(resolved).isEqualTo(unknownKey);

        String customDefault = messageService.getMessageOrDefault(unknownKey, "Varsayılan Yedek Mesaj");
        assertThat(customDefault).isEqualTo("Varsayılan Yedek Mesaj");
    }

    @Test
    @DisplayName("5. Thread-Local LocaleContextHolder üzerinden otomatik dil tespiti")
    void shouldResolveBasedOnLocaleContextHolder() {
        try {
            LocaleContextHolder.setLocale(Locale.of("en", "US"));
            String enMsg = messageService.getMessage("general.success");
            assertThat(enMsg).isEqualTo("Operation completed successfully.");

            LocaleContextHolder.setLocale(Locale.of("de", "DE"));
            String deMsg = messageService.getMessage("general.success");
            assertThat(deMsg).isEqualTo("Vorgang erfolgreich abgeschlossen.");
        } finally {
            LocaleContextHolder.resetLocaleContext();
        }
    }
}

