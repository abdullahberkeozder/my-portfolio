package com.berkeozder.security.ratelimit;

import lombok.Getter;

/**
 * Token Bucket Algoritması:
 * Sabit kapasiteli bir havuz ve zamana dayalı sürekli token doldurma mantığıyla çalışır.
 * Thread-safe (eşzamanlı erişime uygun) olarak tasarlanmıştır.
 *
 * @author Berke Özder
 */
public class TokenBucket {

    @Getter
    private final long capacity;
    private final double refillRatePerSecond;
    private double tokens;
    private long lastRefillNanos;

    public TokenBucket(long capacity, long durationSeconds) {
        if (capacity <= 0) {
            throw new IllegalArgumentException("Kapasite 0'dan büyük olmalıdır.");
        }
        if (durationSeconds <= 0) {
            throw new IllegalArgumentException("Süre 0'dan büyük olmalıdır.");
        }
        this.capacity = capacity;
        this.refillRatePerSecond = (double) capacity / durationSeconds;
        this.tokens = capacity;
        this.lastRefillNanos = System.nanoTime();
    }

    /**
     * İstenen miktarda token tüketmeye çalışır.
     *
     * @param requestedTokens Talep edilen token adedi (genellikle 1)
     * @return Yeterli token varsa true ve bakiye düşülür, yoksa false döner.
     */
    public synchronized boolean tryConsume(int requestedTokens) {
        refill();
        if (tokens >= requestedTokens) {
            tokens -= requestedTokens;
            return true;
        }
        return false;
    }

    /**
     * Havuzdaki mevcut kalan token miktarını tam sayı olarak döner.
     */
    public synchronized long getRemainingTokens() {
        refill();
        return (long) Math.floor(tokens);
    }

    /**
     * En az 1 token dolana kadar geçmesi gereken tahmini bekleme süresini (saniye) hesaplar.
     */
    public synchronized long getSecondsUntilNextRefill() {
        refill();
        if (tokens >= 1.0) {
            return 0;
        }
        double needed = 1.0 - tokens;
        return Math.max(1, (long) Math.ceil(needed / refillRatePerSecond));
    }

    /**
     * Geçen süreye göre token'ları havuza geri doldurur (Kapasiteyi aşmayacak şekilde).
     */
    private void refill() {
        long now = System.nanoTime();
        double elapsedSeconds = (now - lastRefillNanos) / 1_000_000_000.0;
        if (elapsedSeconds > 0) {
            tokens = Math.min((double) capacity, tokens + (elapsedSeconds * refillRatePerSecond));
            lastRefillNanos = now;
        }
    }
}

