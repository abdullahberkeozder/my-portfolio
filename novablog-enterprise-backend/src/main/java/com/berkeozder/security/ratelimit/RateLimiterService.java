package com.berkeozder.security.ratelimit;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

/**
 * IP ve Endpoint bazlı Token Bucket Hız Sınırlama Servisi.
 * Brute-force saldırılarını engeller ve DoS koruması sağlar.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
public class RateLimiterService {

    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.rate-limit.auth.capacity:10}")
    private long authCapacity;

    @Value("${app.rate-limit.auth.duration-seconds:60}")
    private long authDurationSeconds;

    @Value("${app.rate-limit.search.capacity:30}")
    private long searchCapacity;

    @Value("${app.rate-limit.search.duration-seconds:60}")
    private long searchDurationSeconds;

    @Value("${app.rate-limit.upload.capacity:15}")
    private long uploadCapacity;

    @Value("${app.rate-limit.upload.duration-seconds:60}")
    private long uploadDurationSeconds;

    @Value("${app.rate-limit.general.capacity:100}")
    private long generalCapacity;

    @Value("${app.rate-limit.general.duration-seconds:60}")
    private long generalDurationSeconds;

    public RateLimiterService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Gelen isteğin hız sınırını kontrol eder ve bir token tüketir.
     */
    public RateLimitResult checkRateLimit(HttpServletRequest request) {
        if (!enabled) {
            return RateLimitResult.builder()
                    .allowed(true)
                    .capacity(generalCapacity)
                    .remainingTokens(generalCapacity)
                    .retryAfterSeconds(0)
                    .build();
        }

        String uri = request.getRequestURI();
        if (uri == null) {
            uri = "/";
        }

        String clientIp = resolveClientIp(request);
        String category = resolveCategory(uri);

        long capacity = resolveCapacity(category);
        long durationSeconds = resolveDurationSeconds(category);

        String bucketKey = clientIp + ":" + category;
        TokenBucket bucket = buckets.computeIfAbsent(bucketKey, k -> new TokenBucket(capacity, durationSeconds));

        boolean allowed = bucket.tryConsume(1);
        long remaining = bucket.getRemainingTokens();
        long retryAfter = allowed ? 0 : bucket.getSecondsUntilNextRefill();

        if (!allowed) {
            log.warn("Rate limit aşıldı! IP: {}, Kategori: {}, URI: {}, Bekleme Süresi: {}s",
                    clientIp, category, uri, retryAfter);

            if (meterRegistry != null) {
                Counter.builder("api.rate.limit.exceeded")
                        .tag("category", category)
                        .tag("client_ip", clientIp)
                        .description("Rate limit aşım sayısı")
                        .register(meterRegistry)
                        .increment();
            }
        }

        return RateLimitResult.builder()
                .allowed(allowed)
                .capacity(capacity)
                .remainingTokens(remaining)
                .retryAfterSeconds(retryAfter)
                .build();
    }

    /**
     * İstemcinin gerçek IP adresini Proxy ve Load Balancer başlıklarını (X-Forwarded-For, X-Real-IP)
     * inceleyerek tespit eder.
     */
    public String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "127.0.0.1";
    }

    /**
     * İstek adresine göre hız sınırı kategorisini belirler.
     */
    public String resolveCategory(String uri) {
        if (uri.startsWith("/api/v1/auth/")) {
            return "auth";
        }
        if (uri.startsWith("/blog/api/v1.0.0/search")) {
            return "search";
        }
        if (uri.startsWith("/blog/api/v1.0.0/upload")) {
            return "upload";
        }
        return "general";
    }

    private long resolveCapacity(String category) {
        return switch (category) {
            case "auth" -> authCapacity;
            case "search" -> searchCapacity;
            case "upload" -> uploadCapacity;
            default -> generalCapacity;
        };
    }

    private long resolveDurationSeconds(String category) {
        return switch (category) {
            case "auth" -> authDurationSeconds;
            case "search" -> searchDurationSeconds;
            case "upload" -> uploadDurationSeconds;
            default -> generalDurationSeconds;
        };
    }

    /**
     * Testlerde bucket durumunu sıfırlamak için kullanılır.
     */
    public void resetBuckets() {
        buckets.clear();
    }

    /**
     * Periyodik hafıza temizliği: Token kapasitesi tamamen dolmuş olan (yani aktif olmayan)
     * istemcilerin bucket nesnelerini temizler.
     */
    @Scheduled(fixedRate = 300000)
    public void cleanupUnusedBuckets() {
        buckets.entrySet().removeIf(entry -> entry.getValue().getRemainingTokens() >= entry.getValue().getCapacity());
    }
}

