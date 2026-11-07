package com.berkeozder.i18n;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

/**
 * Uygulama genelinde çoklu dil ve mesaj çözümleme servisi.
 *
 * Spring Context'in LocaleContextHolder yapısını kullanarak o anki HTTP isteğinin
 * çözümlenmiş Locale değerine göre doğru dildeki mesajı döndürür.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageSource messageSource;

    /**
     * O anki istek bağlamındaki (thread-local) Locale ile mesajı çözer.
     *
     * @param code Mesaj anahtarı (örn: "general.success")
     * @return Çözümlenmiş mesaj veya anahtarın kendisi
     */
    public String getMessage(String code) {
        return getMessage(code, (Object[]) null);
    }

    /**
     * O anki istek bağlamındaki Locale ve parametrelerle mesajı çözer.
     *
     * @param code Mesaj anahtarı
     * @param args Mesaj içi parametreler ({0}, {1}, ...)
     * @return Çözümlenmiş ve parametreleri yerleştirilmiş mesaj
     */
    public String getMessage(String code, Object... args) {
        Locale locale = getCurrentLocale();
        return getMessage(code, locale, args);
    }

    /**
     * Belirtilen özel Locale ve parametrelerle mesajı çözer.
     *
     * @param code Mesaj anahtarı
     * @param locale Hedef dil ve bölge
     * @param args Mesaj içi parametreler
     * @return Çözümlenmiş mesaj
     */
    public String getMessage(String code, Locale locale, Object... args) {
        Locale targetLocale = (locale != null) ? locale : SmartLocaleResolver.LOCALE_TR;
        return messageSource.getMessage(code, args, code, targetLocale);
    }

    /**
     * Mesaj anahtarı bulunamadığında belirtilen varsayılan mesajı döner.
     *
     * @param code Mesaj anahtarı
     * @param defaultMessage Bulunamadığında dönülecek metin
     * @param args Parametreler
     * @return Çözümlenmiş mesaj veya defaultMessage
     */
    public String getMessageOrDefault(String code, String defaultMessage, Object... args) {
        Locale locale = getCurrentLocale();
        return messageSource.getMessage(code, args, defaultMessage, locale);
    }

    /**
     * O anki HTTP isteğinde çözümlenen aktif Locale bilgisini döner.
     *
     * @return Aktif Locale
     */
    public Locale getCurrentLocale() {
        Locale locale = LocaleContextHolder.getLocale();
        return (locale != null) ? locale : SmartLocaleResolver.LOCALE_TR;
    }
}

