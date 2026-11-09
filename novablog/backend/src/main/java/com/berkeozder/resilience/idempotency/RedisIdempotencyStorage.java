package com.berkeozder.resilience.idempotency;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;
import java.util.Optional;

/**
 * Dağıtık Redis Idempotency saklama katmanı.
 * Yatayda ölçeklenen birden fazla pod/sunucu arasında çift işlem yapılmasını önler.
 *
 * @author Berke Özder
 */
@Log4j2
@RequiredArgsConstructor
public class RedisIdempotencyStorage implements IdempotencyStorage {

    private static final String KEY_PREFIX = "idempotency:";

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean lock(String key, long ttlSeconds) {
        try {
            String redisKey = KEY_PREFIX + key;
            IdempotencyRecord record = IdempotencyRecord.builder()
                    .key(key)
                    .status(IdempotencyStatus.PROCESSING)
                    .createdAt(System.currentTimeMillis())
                    .build();

            String json = objectMapper.writeValueAsString(record);
            Boolean acquired = redisTemplate.opsForValue().setIfAbsent(redisKey, json, Duration.ofSeconds(ttlSeconds));
            return Boolean.TRUE.equals(acquired);
        } catch (Exception e) {
            log.error("Redis Idempotency lock hatası (key: {}): {}", key, e.getMessage());
            return false;
        }
    }

    @Override
    public Optional<IdempotencyRecord> get(String key) {
        try {
            String redisKey = KEY_PREFIX + key;
            String json = redisTemplate.opsForValue().get(redisKey);
            if (json == null || json.isBlank()) {
                return Optional.empty();
            }
            return Optional.ofNullable(objectMapper.readValue(json, IdempotencyRecord.class));
        } catch (Exception e) {
            log.warn("Redis Idempotency get hatası (key: {}): {}", key, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public void complete(String key, int statusCode, String contentType, String responseBody, long ttlSeconds) {
        try {
            String redisKey = KEY_PREFIX + key;
            IdempotencyRecord record = IdempotencyRecord.builder()
                    .key(key)
                    .status(IdempotencyStatus.COMPLETED)
                    .statusCode(statusCode)
                    .contentType(contentType)
                    .responseBody(responseBody)
                    .createdAt(System.currentTimeMillis())
                    .build();

            String json = objectMapper.writeValueAsString(record);
            redisTemplate.opsForValue().set(redisKey, json, Duration.ofSeconds(ttlSeconds));
        } catch (Exception e) {
            log.error("Redis Idempotency complete hatası (key: {}): {}", key, e.getMessage());
        }
    }

    @Override
    public void unlock(String key) {
        try {
            String redisKey = KEY_PREFIX + key;
            redisTemplate.delete(redisKey);
        } catch (Exception e) {
            log.warn("Redis Idempotency unlock hatası (key: {}): {}", key, e.getMessage());
        }
    }
}
