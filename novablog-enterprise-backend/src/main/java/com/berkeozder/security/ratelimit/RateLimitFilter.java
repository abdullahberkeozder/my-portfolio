package com.berkeozder.security.ratelimit;

import com.berkeozder.error.ApiResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Spring Security filtre zincirinde en önde çalışan Hız Sınırlama (Rate Limiting) Filtresi.
 * İstemci hız sınırını aşarsa HTTP 429 Too Many Requests ve standart RFC başlıkları döner.
 *
 * @author Berke Özder
 */
@Log4j2
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri == null) {
            return false;
        }

        // Swagger, Actuator, H2-Console ve statik web kaynaklarını filtre muafiyetine al
        return uri.startsWith("/actuator")
                || uri.startsWith("/swagger-ui")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/h2-console")
                || uri.startsWith("/css/")
                || uri.startsWith("/js/")
                || uri.startsWith("/images/")
                || uri.startsWith("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        RateLimitResult result = rateLimiterService.checkRateLimit(request);

        // Standart RFC Hız Sınırı Başlıkları (Rate-Limit Headers)
        response.setHeader("X-RateLimit-Limit", String.valueOf(result.getCapacity()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(result.getRemainingTokens()));

        if (!result.isAllowed()) {
            response.setStatus(429); // 429 Too Many Requests
            response.setHeader("Retry-After", String.valueOf(result.getRetryAfterSeconds()));
            response.setHeader("X-RateLimit-Retry-After-Seconds", String.valueOf(result.getRetryAfterSeconds()));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            ApiResult<Void> apiResult = ApiResult.tooManyRequests(
                    "Çok fazla istek gönderildi. Hız sınırı aşıldı! Lütfen " + result.getRetryAfterSeconds() + " saniye sonra tekrar deneyiniz.",
                    request.getRequestURI()
            );

            objectMapper.writeValue(response.getOutputStream(), apiResult);
            return;
        }

        filterChain.doFilter(request, response);
    }
}

