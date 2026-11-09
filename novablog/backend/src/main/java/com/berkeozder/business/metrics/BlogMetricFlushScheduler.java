package com.berkeozder.business.metrics;

import com.berkeozder.data.repository.IBlogRepository;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Write-Behind Deseni Blog Metrik Zamanlayıcısı (Batch DB Flusher).
 * Bellekte veya Redis'te biriken görüntülenme ve beğeni sayaçlarını periyodik olarak
 * veritabanına toplu (batch) yerel sorgularla yansıtır.
 *
 * Faydaları:
 * - Sayfa açılışlarında veya yoğun beğenilerde DB satır kilitlenmesini (row-lock contention) engeller.
 * - JPA @Version optimistik kilit tetiklenmesini önleyerek yazar güncellemeleriyle çakışmayı sıfıra indirir.
 * - Sunucu kapanışında (@PreDestroy) bekleyen tüm metrikleri otomatik kaydeder.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class BlogMetricFlushScheduler {

    private final IBlogMetricBufferService metricBufferService;
    private final IBlogRepository blogRepository;

    /**
     * Varsayılan 30 saniyede bir (app.metrics.flush-rate-ms) tamponlanmış sayaçları veritabanına yazar.
     */
    @Scheduled(fixedDelayString = "${app.metrics.flush-rate-ms:30000}", initialDelayString = "${app.metrics.initial-delay-ms:10000}")
    @Transactional
    public void flushMetrics() {
        Map<Long, Long> views = metricBufferService.drainViewBuffer();
        Map<Long, Long> likes = metricBufferService.drainLikeBuffer();

        if (views.isEmpty() && likes.isEmpty()) {
            return;
        }

        AtomicInteger updatedViewsCount = new AtomicInteger();
        AtomicInteger updatedLikesCount = new AtomicInteger();

        views.forEach((blogId, delta) -> {
            if (delta != 0) {
                try {
                    int affected = blogRepository.incrementViewsCountNative(blogId, delta);
                    if (affected > 0) {
                        updatedViewsCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    log.error("Blog görüntülenme sayısı DB'ye yazılamadı (blogId: {}, delta: {}): {}", blogId, delta, e.getMessage());
                }
            }
        });

        likes.forEach((blogId, delta) -> {
            if (delta != 0) {
                try {
                    int affected = blogRepository.incrementLikesCountNative(blogId, delta);
                    if (affected > 0) {
                        updatedLikesCount.incrementAndGet();
                    }
                } catch (Exception e) {
                    log.error("Blog beğeni sayısı DB'ye yazılamadı (blogId: {}, delta: {}): {}", blogId, delta, e.getMessage());
                }
            }
        });

        log.info("📊 [WRITE-BEHIND FLUSH] Blog metrikleri DB'ye aktarıldı. Güncellenen bloglar - Görüntülenme: {}, Beğeni: {}",
                updatedViewsCount.get(), updatedLikesCount.get());
    }

    /**
     * Graceful Shutdown: Uygulama kapatılırken tamponda bekleyen verileri kaybetmemek için zorunlu flush.
     */
    @PreDestroy
    public void flushOnShutdown() {
        log.info("🛑 [GRACEFUL_SHUTDOWN] Sunucu kapanıyor, tamponlanmış metrikler DB'ye yazılıyor...");
        try {
            flushMetrics();
        } catch (Exception e) {
            log.error("Graceful shutdown metrik aktarımı hatası: {}", e.getMessage());
        }
    }
}

