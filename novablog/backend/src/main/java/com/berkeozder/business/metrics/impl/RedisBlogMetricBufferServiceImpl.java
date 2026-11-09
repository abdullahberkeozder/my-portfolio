package com.berkeozder.business.metrics.impl;

import com.berkeozder.business.metrics.IBlogMetricBufferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Dağıtık Redis Tabanlı Blog Metrik Tamponlayıcı (Redis Hash / HINCRBY).
 * Birden fazla pod / replica çalışan mikroservis mimarisinde sayaç güncellemelerini
 * Redis belleğinde biriktirip periyodik DB yazımları (Write-Behind) için boşaltır.
 *
 * @author Berke Özder
 */
@Log4j2
@RequiredArgsConstructor
public class RedisBlogMetricBufferServiceImpl implements IBlogMetricBufferService {

    public static final String REDIS_KEY_VIEWS = "novablog:metrics:views:buffer";
    public static final String REDIS_KEY_LIKES = "novablog:metrics:likes:buffer";

    private final StringRedisTemplate redisTemplate;

    @Override
    public void incrementView(Long blogId) {
        if (blogId == null) return;
        try {
            redisTemplate.opsForHash().increment(REDIS_KEY_VIEWS, blogId.toString(), 1L);
        } catch (Exception e) {
            log.warn("Redis view buffer increment hatası (blogId: {}): {}", blogId, e.getMessage());
        }
    }

    @Override
    public void incrementLike(Long blogId) {
        if (blogId == null) return;
        try {
            redisTemplate.opsForHash().increment(REDIS_KEY_LIKES, blogId.toString(), 1L);
        } catch (Exception e) {
            log.warn("Redis like buffer increment hatası (blogId: {}): {}", blogId, e.getMessage());
        }
    }

    @Override
    public void decrementLike(Long blogId) {
        if (blogId == null) return;
        try {
            redisTemplate.opsForHash().increment(REDIS_KEY_LIKES, blogId.toString(), -1L);
        } catch (Exception e) {
            log.warn("Redis like buffer decrement hatası (blogId: {}): {}", blogId, e.getMessage());
        }
    }

    @Override
    public long getBufferedViews(Long blogId) {
        if (blogId == null) return 0L;
        return parseLongFromHash(REDIS_KEY_VIEWS, blogId);
    }

    @Override
    public long getBufferedLikes(Long blogId) {
        if (blogId == null) return 0L;
        return parseLongFromHash(REDIS_KEY_LIKES, blogId);
    }

    @Override
    public Map<Long, Long> drainViewBuffer() {
        return drainHashKey(REDIS_KEY_VIEWS);
    }

    @Override
    public Map<Long, Long> drainLikeBuffer() {
        return drainHashKey(REDIS_KEY_LIKES);
    }

    @Override
    public boolean isBufferEmpty() {
        try {
            Boolean hasViews = redisTemplate.hasKey(REDIS_KEY_VIEWS);
            Boolean hasLikes = redisTemplate.hasKey(REDIS_KEY_LIKES);
            return !Boolean.TRUE.equals(hasViews) && !Boolean.TRUE.equals(hasLikes);
        } catch (Exception e) {
            log.warn("Redis buffer empty check hatası: {}", e.getMessage());
            return true;
        }
    }

    private long parseLongFromHash(String hashKey, Long blogId) {
        try {
            Object raw = redisTemplate.opsForHash().get(hashKey, blogId.toString());
            if (raw == null) return 0L;
            return Long.parseLong(raw.toString());
        } catch (Exception e) {
            log.warn("Redis buffer parse hatası (key: {}, blogId: {}): {}", hashKey, blogId, e.getMessage());
            return 0L;
        }
    }

    /**
     * Atomik boşaltma (Drain): Redis anahtarı atomik RENAME ile geçici anahtara taşınır.
     * Bu sayede taşıma anından sonra gelen yeni sayaç istekleri kaybolmaz; yeni bir hash anahtarında birikir.
     */
    private Map<Long, Long> drainHashKey(String primaryKey) {
        Map<Long, Long> result = new HashMap<>();
        try {
            Boolean exists = redisTemplate.hasKey(primaryKey);
            if (!Boolean.TRUE.equals(exists)) {
                return result;
            }

            String processingKey = primaryKey + ":processing:" + UUID.randomUUID();
            try {
                redisTemplate.rename(primaryKey, processingKey);
            } catch (Exception e) {
                // Anahtar taşınamadıysa (örneğin eşzamanlı başka flush veya boş anahtar)
                return result;
            }

            Map<Object, Object> rawEntries = redisTemplate.opsForHash().entries(processingKey);
            if (rawEntries != null) {
                for (Map.Entry<Object, Object> entry : rawEntries.entrySet()) {
                    try {
                        Long blogId = Long.parseLong(entry.getKey().toString());
                        long delta = Long.parseLong(entry.getValue().toString());
                        if (delta != 0) {
                            result.put(blogId, delta);
                        }
                    } catch (NumberFormatException nfe) {
                        log.warn("Geçersiz blog id veya delta: {} -> {}", entry.getKey(), entry.getValue());
                    }
                }
            }

            // Geçici işlem anahtarını sil
            redisTemplate.delete(processingKey);
        } catch (Exception e) {
            log.error("Redis buffer drain hatası (key: {}): {}", primaryKey, e.getMessage());
        }
        return result;
    }
}

