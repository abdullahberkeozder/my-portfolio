package com.berkeozder.batch.service;

import com.berkeozder.batch.config.BatchConfig;
import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemWriter;
import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;
import com.berkeozder.business.dto.batch.StepExecutionSummaryDto;
import com.berkeozder.exception.BerkeOzderException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobInstance;
import org.springframework.batch.core.job.parameters.JobParameter;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.explore.JobExplorer;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Log4j2
@Service
@RequiredArgsConstructor
public class BatchJobServiceImpl implements IBatchJobService {

    private final JobLauncher jobLauncher;
    private final JobExplorer jobExplorer;

    @Qualifier(BatchConfig.CLEANUP_SOFT_DELETED_JOB)
    private final Job cleanupSoftDeletedJob;

    @Qualifier(BatchConfig.AUTHOR_ANALYTICS_JOB)
    private final Job authorAnalyticsJob;

    private final AuthorAnalyticsItemWriter authorAnalyticsItemWriter;

    @Override
    public JobExecutionResponseDto runCleanupJob(Integer daysOld) {
        int days = (daysOld != null && daysOld >= 0) ? daysOld : 30;
        long cutoffTimeMillis = System.currentTimeMillis() - ((long) days * 24L * 60L * 60L * 1000L);

        log.info("Soft-deleted blog temizleme işi (Batch Job) tetikleniyor. Gün eşiği: {}, Cutoff Time: {}", days, cutoffTimeMillis);

        JobParameters params = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .addLong("cutoffTimeMillis", cutoffTimeMillis)
                .addLong("daysOld", (long) days)
                .toJobParameters();

        try {
            JobExecution execution = jobLauncher.run(cleanupSoftDeletedJob, params);
            return mapToDto(execution);
        } catch (Exception e) {
            log.error("Temizlik Batch Job çalıştırılırken hata: {}", e.getMessage(), e);
            throw new BerkeOzderException("Batch Job [cleanupSoftDeletedJob] başlatılamadı: " + e.getMessage());
        }
    }

    @Override
    public JobExecutionResponseDto runAuthorAnalyticsJob() {
        log.info("Yazar analitik raporlama işi (Batch Job) tetikleniyor...");

        JobParameters params = new JobParametersBuilder()
                .addLong("timestamp", System.currentTimeMillis())
                .addString("type", "MONTHLY_ANALYTICS")
                .toJobParameters();

        try {
            JobExecution execution = jobLauncher.run(authorAnalyticsJob, params);
            return mapToDto(execution);
        } catch (Exception e) {
            log.error("Yazar analitik Batch Job çalıştırılırken hata: {}", e.getMessage(), e);
            throw new BerkeOzderException("Batch Job [authorAnalyticsJob] başlatılamadı: " + e.getMessage());
        }
    }

    @Override
    public JobExecutionResponseDto getJobExecution(Long executionId) {
        if (executionId == null) {
            throw new BerkeOzderException("Geçersiz iş yürütme kimliği (Execution ID null olamaz).");
        }

        JobExecution execution = jobExplorer.getJobExecution(executionId);
        if (execution == null) {
            throw new BerkeOzderException("İş yürütme kaydı bulunamadı. ID: " + executionId);
        }

        return mapToDto(execution);
    }

    @Override
    public List<JobExecutionResponseDto> getRecentJobExecutions() {
        List<JobExecutionResponseDto> result = new ArrayList<>();
        List<String> jobNames = jobExplorer.getJobNames();

        for (String jobName : jobNames) {
            List<JobInstance> instances = jobExplorer.getJobInstances(jobName, 0, 10);
            for (JobInstance instance : instances) {
                List<JobExecution> executions = jobExplorer.getJobExecutions(instance);
                for (JobExecution execution : executions) {
                    result.add(mapToDto(execution));
                }
            }
        }

        result.sort(Comparator.comparing(JobExecutionResponseDto::getJobExecutionId, Comparator.nullsLast(Comparator.reverseOrder())));
        if (result.size() > 20) {
            return result.subList(0, 20);
        }
        return result;
    }

    @Override
    public List<AuthorAnalyticsReportDto> getLatestAuthorAnalyticsReport() {
        return authorAnalyticsItemWriter.getCollectedReports();
    }

    private JobExecutionResponseDto mapToDto(JobExecution execution) {
        LocalDateTime startTime = execution.getStartTime();
        LocalDateTime endTime = execution.getEndTime();
        Long durationMs = (startTime != null && endTime != null)
                ? Duration.between(startTime, endTime).toMillis()
                : null;

        Map<String, Object> paramMap = new HashMap<>();
        if (execution.getJobParameters() != null) {
            for (JobParameter<?> param : execution.getJobParameters()) {
                paramMap.put(param.name(), param.value());
            }
        }

        List<StepExecutionSummaryDto> stepSummaries = execution.getStepExecutions().stream()
                .map(step -> StepExecutionSummaryDto.builder()
                        .stepName(step.getStepName())
                        .status(step.getStatus() != null ? step.getStatus().name() : null)
                        .readCount(step.getReadCount())
                        .writeCount(step.getWriteCount())
                        .filterCount(step.getFilterCount())
                        .skipCount(step.getSkipCount())
                        .commitCount(step.getCommitCount())
                        .rollbackCount(step.getRollbackCount())
                        .exitCode(step.getExitStatus() != null ? step.getExitStatus().getExitCode() : null)
                        .build())
                .toList();

        return JobExecutionResponseDto.builder()
                .jobExecutionId(execution.getId())
                .jobName(execution.getJobInstance() != null ? execution.getJobInstance().getJobName() : null)
                .status(execution.getStatus() != null ? execution.getStatus().name() : null)
                .exitCode(execution.getExitStatus() != null ? execution.getExitStatus().getExitCode() : null)
                .exitDescription(execution.getExitStatus() != null ? execution.getExitStatus().getExitDescription() : null)
                .startTime(toDate(startTime))
                .endTime(toDate(endTime))
                .durationMs(durationMs)
                .parameters(paramMap)
                .stepExecutions(stepSummaries)
                .build();
    }

    private Date toDate(LocalDateTime ldt) {
        if (ldt == null) {
            return null;
        }
        return Date.from(ldt.atZone(ZoneId.systemDefault()).toInstant());
    }
}

