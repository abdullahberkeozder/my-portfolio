package com.berkeozder;

import com.berkeozder.batch.scheduler.BatchJobScheduler;
import com.berkeozder.batch.service.IBatchJobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("BatchJobScheduler Unit Tests")
class BatchJobSchedulerTest {

    @Mock
    private IBatchJobService batchJobService;

    private BatchJobScheduler scheduler;

    @BeforeEach
    void setUp() {
        scheduler = new BatchJobScheduler(batchJobService);
    }

    @Test
    @DisplayName("Zamanlanmış soft-delete temizliği batchJobService.runCleanupJob(30) çağrısı yapmalı")
    void shouldTriggerScheduledCleanupJob() {
        scheduler.scheduleCleanupJob();

        verify(batchJobService).runCleanupJob(30);
    }

    @Test
    @DisplayName("Zamanlanmış yazar analitiği batchJobService.runAuthorAnalyticsJob() çağrısı yapmalı")
    void shouldTriggerScheduledAuthorAnalyticsJob() {
        scheduler.scheduleAuthorAnalyticsJob();

        verify(batchJobService).runAuthorAnalyticsJob();
    }
}

