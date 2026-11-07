package com.berkeozder.batch.config;

import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;
import org.springframework.batch.core.step.StepExecution;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;

@Log4j2
@Component
public class BatchJobExecutionListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        log.info("================================================================================");
        log.info(">>> SPRING BATCH JOB BAŞLATILDI: [{}] (Execution ID: {})",
                jobExecution.getJobInstance().getJobName(), jobExecution.getId());
        log.info("Başlangıç Zamanı: {}", jobExecution.getStartTime());
        log.info("Parametreler: {}", jobExecution.getJobParameters().parameters());
        log.info("================================================================================");
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        LocalDateTime startTime = jobExecution.getStartTime();
        LocalDateTime endTime = jobExecution.getEndTime();
        long durationMs = (startTime != null && endTime != null)
                ? Duration.between(startTime, endTime).toMillis()
                : 0L;

        log.info("================================================================================");
        log.info("<<< SPRING BATCH JOB TAMAMLANDI: [{}] (Execution ID: {})",
                jobExecution.getJobInstance().getJobName(), jobExecution.getId());
        log.info("Durum: {} | Çıkış Kodu: {} | Süre: {} ms",
                jobExecution.getStatus(), jobExecution.getExitStatus().getExitCode(), durationMs);

        for (StepExecution stepExecution : jobExecution.getStepExecutions()) {
            log.info("   * Step [{}]: Durum={}, Okunan={}, Yazılan={}, Filtrelenen={}, Atlanan={}, Commit={}",
                    stepExecution.getStepName(),
                    stepExecution.getStatus(),
                    stepExecution.getReadCount(),
                    stepExecution.getWriteCount(),
                    stepExecution.getFilterCount(),
                    stepExecution.getSkipCount(),
                    stepExecution.getCommitCount());
        }

        if (!jobExecution.getAllFailureExceptions().isEmpty()) {
            log.error("Job yürütülürken hata(lar) meydana geldi:");
            for (Throwable th : jobExecution.getAllFailureExceptions()) {
                log.error("   -> Hata Detayı: {}", th.getMessage());
            }
        }
        log.info("================================================================================");
    }
}
