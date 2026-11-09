package com.berkeozder.resilience.idempotency;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.Set;

/**
 * Enterprise Idempotency Filter (X-Idempotency-Key).
 * Ağ kopmalarında veya mükerrer tıklamalarda çift işlem yapılmasını ve
 * veri tabanında çift kayıt oluşmasını garantili olarak önler.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 15)
@RequiredArgsConstructor
public class IdempotencyFilter extends OncePerRequestFilter {

    public static final String IDEMPOTENCY_HEADER = "X-Idempotency-Key";
    public static final String STATUS_HEADER = "X-Idempotency-Status";

    private static final Set<String> MUTATING_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");
    private static final long LOCK_TTL_SECONDS = 120; // 2 dakika processing kilidi
    private static final long CACHE_TTL_SECONDS = 86400; // 24 saat sonuç önbelleği

    private final IdempotencyStorage idempotencyStorage;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String method = request.getMethod().toUpperCase();
        String idempotencyKey = request.getHeader(IDEMPOTENCY_HEADER);

        // Header yoksa veya mutasyon metodu değilse doğrudan devam et
        if (idempotencyKey == null || idempotencyKey.isBlank() || !MUTATING_METHODS.contains(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        idempotencyKey = idempotencyKey.trim();

        // 1. Önceki istek durumunu sorgula
        Optional<IdempotencyRecord> existingOpt = idempotencyStorage.get(idempotencyKey);
        if (existingOpt.isPresent()) {
            IdempotencyRecord existing = existingOpt.get();

            // Durum COMPLETED ise önbellekten dön (Short-circuit)
            if (existing.getStatus() == IdempotencyStatus.COMPLETED) {
                log.info("Idempotency: Önbellekten yanıt dönülüyor (Key: {}, Status: {})", idempotencyKey, existing.getStatusCode());
                response.setStatus(existing.getStatusCode());
                if (existing.getContentType() != null) {
                    response.setContentType(existing.getContentType());
                } else {
                    response.setContentType("application/json;charset=UTF-8");
                }
                response.setHeader(STATUS_HEADER, "CACHED");
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                if (existing.getResponseBody() != null) {
                    response.getWriter().write(existing.getResponseBody());
                }
                response.getWriter().flush();
                return;
            }

            // Durum PROCESSING ise eşzamanlı çakışma (409 Conflict)
            if (existing.getStatus() == IdempotencyStatus.PROCESSING) {
                log.warn("Idempotency: Eşzamanlı mükerrer istek reddedildi (Key: {})", idempotencyKey);
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                response.setContentType("application/problem+json;charset=UTF-8");
                response.setHeader(STATUS_HEADER, "CONFLICT");
                String conflictBody = String.format(
                        "{\"type\":\"https://novablog.com/errors/idempotency-conflict\"," +
                        "\"title\":\"Idempotency Conflict\"," +
                        "\"status\":409," +
                        "\"detail\":\"A concurrent request with Idempotency-Key '%s' is currently being processed. Please retry shortly.\"," +
                        "\"instance\":\"%s\"}",
                        idempotencyKey, request.getRequestURI()
                );
                response.getWriter().write(conflictBody);
                response.getWriter().flush();
                return;
            }
        }

        // 2. Kilit almayı dene
        boolean locked = idempotencyStorage.lock(idempotencyKey, LOCK_TTL_SECONDS);
        if (!locked) {
            log.warn("Idempotency: Kilit alınamadı (Key: {})", idempotencyKey);
            response.setStatus(HttpServletResponse.SC_CONFLICT);
            response.setContentType("application/problem+json;charset=UTF-8");
            response.setHeader(STATUS_HEADER, "CONFLICT");
            String conflictBody = String.format(
                    "{\"type\":\"https://novablog.com/errors/idempotency-conflict\"," +
                    "\"title\":\"Idempotency Conflict\"," +
                    "\"status\":409," +
                    "\"detail\":\"A concurrent request with Idempotency-Key '%s' is currently being processed.\"," +
                    "\"instance\":\"%s\"}",
                    idempotencyKey, request.getRequestURI()
            );
            response.getWriter().write(conflictBody);
            response.getWriter().flush();
            return;
        }

        // 3. İsteği çalıştır ve yanıtı yakala
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        wrappedResponse.setHeader(STATUS_HEADER, "EXECUTED");

        try {
            filterChain.doFilter(request, wrappedResponse);

            int status = wrappedResponse.getStatus();
            // 5xx sunucu hatalarında istemcinin tekrar deneyebilmesi için kilidi aç
            if (status >= 500) {
                log.warn("Idempotency: Sunucu hatası (Status: {}), kilit serbest bırakılıyor (Key: {})", status, idempotencyKey);
                idempotencyStorage.unlock(idempotencyKey);
            } else {
                String responseBody = new String(wrappedResponse.getContentAsByteArray(), StandardCharsets.UTF_8);
                idempotencyStorage.complete(
                        idempotencyKey,
                        status,
                        wrappedResponse.getContentType(),
                        responseBody,
                        CACHE_TTL_SECONDS
                );
                log.debug("Idempotency: İstek başarıyla kaydedildi (Key: {}, Status: {})", idempotencyKey, status);
            }
        } catch (Throwable t) {
            log.error("Idempotency: İstek yürütülürken hata oluştu, kilit serbest bırakılıyor (Key: {})", idempotencyKey);
            idempotencyStorage.unlock(idempotencyKey);
            throw t;
        } finally {
            wrappedResponse.copyBodyToResponse();
        }
    }
}
