package com.berkeozder.batch.scheduler;

import com.berkeozder.batch.service.IBatchJobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Log4j2
@Component
@EnableScheduling
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.batch.scheduling.enabled", havingValue = "true", matchIfMissing = false)
public class BatchJobScheduler {

    private final IBatchJobService batchJobService;

    /**
     * Her gece saat 02:00'de soft-deleted blogları kalıcı olarak temizler (30 günden eski olanlar).
     */
    @Scheduled(cron = "${app.batch.cleanup.cron:0 0 2 * * ?}")
    public void scheduleCleanupJob() {
        log.info("Batch Scheduler: Otomatik soft-delete temizleme işi tetikleniyor...");
        try {
            batchJobService.runCleanupJob(30);
            log.info("Batch Scheduler: Otomatik soft-delete temizleme işi başarıyla yürütüldü.");
        } catch (Exception e) {
            log.error("Batch Scheduler: Temizlik işi yürütülürken hata oluştu: {}", e.getMessage(), e);
        }
    }

    /**
     * Her ayın 1. günü saat 03:00'te aylık yazar analitik raporunu hesaplar ve CSV oluşturur.
     */
    @Scheduled(cron = "${app.batch.analytics.cron:0 0 3 1 * ?}")
    public void scheduleAuthorAnalyticsJob() {
        log.info("Batch Scheduler: Otomatik yazar analitik raporlama işi tetikleniyor...");
        try {
            batchJobService.runAuthorAnalyticsJob();
            log.info("Batch Scheduler: Otomatik yazar analitik raporlama işi başarıyla yürütüldü.");
        } catch (Exception e) {
            log.error("Batch Scheduler: Yazar analitik işi yürütülürken hata oluştu: {}", e.getMessage(), e);
        }
    }
}

