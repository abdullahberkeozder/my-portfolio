package com.berkeozder.config;

import com.berkeozder.i18n.SmartLocaleResolver;
import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;

import java.nio.charset.StandardCharsets;

/**
 * Enterprise Internationalization (i18n) & Yerelleştirme Konfigürasyonu.
 *
 * Çoklu dil bundle'larını (messages & ValidationMessages) UTF-8 olarak yükler,
 * Hibernate Validator ile entegre eder ve SmartLocaleResolver'ı devreye alır.
 *
 * @author Berke Özder
 */
@Configuration
public class I18nConfig {

    @Bean
    public MessageSource messageSource() {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasenames("classpath:messages", "classpath:ValidationMessages");
        messageSource.setDefaultEncoding(StandardCharsets.UTF_8.name());
        messageSource.setFallbackToSystemLocale(false);
        messageSource.setDefaultLocale(SmartLocaleResolver.LOCALE_TR);
        messageSource.setCacheSeconds(3600);
        return messageSource;
    }

    @Bean
    public LocalValidatorFactoryBean validator(MessageSource messageSource) {
        LocalValidatorFactoryBean bean = new LocalValidatorFactoryBean();
        bean.setValidationMessageSource(messageSource);
        return bean;
    }

    @Bean
    public LocaleResolver localeResolver() {
        return new SmartLocaleResolver();
    }
}

