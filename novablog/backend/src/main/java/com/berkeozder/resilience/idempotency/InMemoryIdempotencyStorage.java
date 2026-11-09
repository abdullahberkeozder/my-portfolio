package com.berkeozder.resilience.idempotency;

import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bellek içi (In-Memory) Idempotency saklama katmanı.
 * Test ve Redis'in kapalı olduğu yerel ortamlarda thread-safe çalışır.
 *
 * @author Berke Özder
 */
@Log4j2
public class InMemoryIdempotencyStorage implements IdempotencyStorage {

    private final Map<String, ExpiringRecord> store = new ConcurrentHashMap<>();

    private record ExpiringRecord(IdempotencyRecord record, long expiresAtMillis) {}

    @Override
    public synchronized boolean lock(String key, long ttlSeconds) {
        cleanExpired();
        ExpiringRecord existing = store.get(key);
        if (existing != null && existing.expiresAtMillis() > System.currentTimeMillis()) {
            return false;
        }

        IdempotencyRecord record = IdempotencyRecord.builder()
                .key(key)
                .status(IdempotencyStatus.PROCESSING)
                .createdAt(System.currentTimeMillis())
                .build();

        long expiresAt = System.currentTimeMillis() + (ttlSeconds * 1000);
        store.put(key, new ExpiringRecord(record, expiresAt));
        return true;
    }

    @Override
    public Optional<IdempotencyRecord> get(String key) {
        cleanExpired();
        ExpiringRecord exp = store.get(key);
        if (exp != null && exp.expiresAtMillis() > System.currentTimeMillis()) {
            return Optional.of(exp.record());
        }
        return Optional.empty();
    }

    @Override
    public void complete(String key, int statusCode, String contentType, String responseBody, long ttlSeconds) {
        IdempotencyRecord record = IdempotencyRecord.builder()
                .key(key)
                .status(IdempotencyStatus.COMPLETED)
                .statusCode(statusCode)
                .contentType(contentType)
                .responseBody(responseBody)
                .createdAt(System.currentTimeMillis())
                .build();

        long expiresAt = System.currentTimeMillis() + (ttlSeconds * 1000);
        store.put(key, new ExpiringRecord(record, expiresAt));
    }

    @Override
    public void unlock(String key) {
        store.remove(key);
    }

    private void cleanExpired() {
        long now = System.currentTimeMillis();
        store.entrySet().removeIf(entry -> entry.getValue().expiresAtMillis() <= now);
    }
}
