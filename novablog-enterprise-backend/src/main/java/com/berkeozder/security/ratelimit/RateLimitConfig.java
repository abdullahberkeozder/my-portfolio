package com.berkeozder.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Hız sınırlama (Rate Limiting) filtre ve zamanlayıcı yapılandırma sınıfı.
 *
 * @author Berke Özder
 */
@Configuration
@EnableScheduling
public class RateLimitConfig {

    @Bean
    public RateLimitFilter rateLimitFilter(RateLimiterService rateLimiterService, ObjectMapper objectMapper) {
        return new RateLimitFilter(rateLimiterService, objectMapper);
    }

    /**
     * Servlet container'ın filtreyi doğrudan çalıştırmasını engeller.
     * Filtre yalnızca Spring Security SecurityFilterChain içerisinde yönetilir.
     */
    @Bean
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(RateLimitFilter rateLimitFilter) {
        FilterRegistrationBean<RateLimitFilter> registration = new FilterRegistrationBean<>(rateLimitFilter);
        registration.setEnabled(false);
        return registration;
    }
}

