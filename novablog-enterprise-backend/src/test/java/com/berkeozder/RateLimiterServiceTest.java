package com.berkeozder;

import com.berkeozder.security.ratelimit.RateLimitResult;
import com.berkeozder.security.ratelimit.RateLimiterService;
import com.berkeozder.security.ratelimit.TokenBucket;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
        rateLimiterService = new RateLimiterService(meterRegistry);

        ReflectionTestUtils.setField(rateLimiterService, "enabled", true);
        ReflectionTestUtils.setField(rateLimiterService, "authCapacity", 5L);
        ReflectionTestUtils.setField(rateLimiterService, "authDurationSeconds", 60L);
        ReflectionTestUtils.setField(rateLimiterService, "searchCapacity", 10L);
        ReflectionTestUtils.setField(rateLimiterService, "searchDurationSeconds", 60L);
        ReflectionTestUtils.setField(rateLimiterService, "uploadCapacity", 5L);
        ReflectionTestUtils.setField(rateLimiterService, "uploadDurationSeconds", 60L);
        ReflectionTestUtils.setField(rateLimiterService, "generalCapacity", 20L);
        ReflectionTestUtils.setField(rateLimiterService, "generalDurationSeconds", 60L);

        rateLimiterService.resetBuckets();
    }

    @Test
    @DisplayName("TokenBucket temel tüketim ve kalan bakiye testi")
    void testTokenBucketConsume() {
        TokenBucket bucket = new TokenBucket(3, 60);
        assertThat(bucket.getCapacity()).isEqualTo(3);
        assertThat(bucket.getRemainingTokens()).isEqualTo(3);

        assertThat(bucket.tryConsume(1)).isTrue();
        assertThat(bucket.getRemainingTokens()).isEqualTo(2);

        assertThat(bucket.tryConsume(1)).isTrue();
        assertThat(bucket.getRemainingTokens()).isEqualTo(1);

        assertThat(bucket.tryConsume(1)).isTrue();
        assertThat(bucket.getRemainingTokens()).isEqualTo(0);

        // 4. deneme başarısız olmalı
        assertThat(bucket.tryConsume(1)).isFalse();
        assertThat(bucket.getSecondsUntilNextRefill()).isGreaterThan(0);
    }

    @Test
    @DisplayName("TokenBucket geçersiz parametre koruması")
    void testTokenBucketInvalidArguments() {
        assertThrows(IllegalArgumentException.class, () -> new TokenBucket(0, 60));
        assertThrows(IllegalArgumentException.class, () -> new TokenBucket(5, 0));
    }

    @Test
    @DisplayName("TokenBucket çoklu iş parçacığı (concurrency) güvenlik testi")
    void testTokenBucketConcurrency() throws InterruptedException {
        int capacity = 50;
        TokenBucket bucket = new TokenBucket(capacity, 60);

        int threadCount = 100;
        ExecutorService executor = Executors.newFixedThreadPool(10);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    if (bucket.tryConsume(1)) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executor.shutdown();

        // 100 thread aynı anda talep etse bile tam olarak kapasite kadar (50) istek onaylanmalıdır
        assertThat(successCount.get()).isEqualTo(capacity);
        assertThat(bucket.getRemainingTokens()).isEqualTo(0);
    }

    @Test
    @DisplayName("RateLimiterService istemci IP çözümleme testi (X-Forwarded-For & X-Real-IP)")
    void testResolveClientIp() {
        MockHttpServletRequest request1 = new MockHttpServletRequest();
        request1.addHeader("X-Forwarded-For", "203.0.113.195, 70.41.3.18");
        assertThat(rateLimiterService.resolveClientIp(request1)).isEqualTo("203.0.113.195");

        MockHttpServletRequest request2 = new MockHttpServletRequest();
        request2.addHeader("X-Real-IP", "198.51.100.22");
        assertThat(rateLimiterService.resolveClientIp(request2)).isEqualTo("198.51.100.22");

        MockHttpServletRequest request3 = new MockHttpServletRequest();
        request3.setRemoteAddr("192.168.1.50");
        assertThat(rateLimiterService.resolveClientIp(request3)).isEqualTo("192.168.1.50");
    }

    @Test
    @DisplayName("RateLimiterService kategori çözümleme testi")
    void testResolveCategory() {
        assertThat(rateLimiterService.resolveCategory("/api/v1/auth/login")).isEqualTo("auth");
        assertThat(rateLimiterService.resolveCategory("/api/v1/auth/register")).isEqualTo("auth");
        assertThat(rateLimiterService.resolveCategory("/blog/api/v1.0.0/search")).isEqualTo("search");
        assertThat(rateLimiterService.resolveCategory("/blog/api/v1.0.0/upload")).isEqualTo("upload");
        assertThat(rateLimiterService.resolveCategory("/blog/api/v1.0.0/list")).isEqualTo("general");
    }

    @Test
    @DisplayName("RateLimiterService Auth limiti aşım testi (5 deneme sonrası HTTP 429)")
    void testRateLimiterServiceAuthLimitExceeded() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");

        // İlk 5 istek başarılı olmalı
        for (int i = 0; i < 5; i++) {
            RateLimitResult result = rateLimiterService.checkRateLimit(request);
            assertThat(result.isAllowed()).isTrue();
            assertThat(result.getCapacity()).isEqualTo(5);
        }

        // 6. istek engellenmeli
        RateLimitResult blocked = rateLimiterService.checkRateLimit(request);
        assertThat(blocked.isAllowed()).isFalse();
        assertThat(blocked.getRemainingTokens()).isEqualTo(0);
        assertThat(blocked.getRetryAfterSeconds()).isGreaterThan(0);
    }

    @Test
    @DisplayName("RateLimiterService farklı IP adreslerinin birbirini etkilememesi testi")
    void testDifferentIpsIsolated() {
        MockHttpServletRequest userA = new MockHttpServletRequest();
        userA.setRequestURI("/api/v1/auth/login");
        userA.setRemoteAddr("10.0.0.2");

        MockHttpServletRequest userB = new MockHttpServletRequest();
        userB.setRequestURI("/api/v1/auth/login");
        userB.setRemoteAddr("10.0.0.3");

        // User A 5 hakkını bitirsin
        for (int i = 0; i < 5; i++) {
            assertThat(rateLimiterService.checkRateLimit(userA).isAllowed()).isTrue();
        }
        assertThat(rateLimiterService.checkRateLimit(userA).isAllowed()).isFalse();

        // User B henüz hiç istek yapmadı, ilk isteği başarılı olmalıdır
        assertThat(rateLimiterService.checkRateLimit(userB).isAllowed()).isTrue();
    }
}

