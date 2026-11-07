package com.berkeozder;

import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemWriter;
import com.berkeozder.batch.service.BatchJobServiceImpl;
import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;
import com.berkeozder.exception.BerkeOzderException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.job.JobInstance;
import org.springframework.batch.core.job.parameters.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.explore.JobExplorer;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("BatchJobServiceImpl Unit Tests")
class BatchJobServiceTest {

    @Mock
    private JobLauncher jobLauncher;

    @Mock
    private JobExplorer jobExplorer;

    @Mock
    private Job cleanupSoftDeletedJob;

    @Mock
    private Job authorAnalyticsJob;

    @Mock
    private AuthorAnalyticsItemWriter authorAnalyticsItemWriter;

    private BatchJobServiceImpl batchJobService;

    @BeforeEach
    void setUp() {
        batchJobService = new BatchJobServiceImpl(
                jobLauncher,
                jobExplorer,
                cleanupSoftDeletedJob,
                authorAnalyticsJob,
                authorAnalyticsItemWriter
        );
    }

    @Test
    @DisplayName("Soft-delete temizleme işi başarıyla başlatılmalı ve DTO dönmeli")
    void shouldRunCleanupJobSuccessfully() throws Exception {
        JobInstance instance = new JobInstance(1L, "cleanupSoftDeletedJob");
        JobExecution execution = new JobExecution(10L, instance, new JobParameters());
        execution.setStatus(BatchStatus.COMPLETED);
        execution.setExitStatus(ExitStatus.COMPLETED);
        execution.setStartTime(LocalDateTime.now().minusSeconds(5));
        execution.setEndTime(LocalDateTime.now());

        when(jobLauncher.run(eq(cleanupSoftDeletedJob), any(JobParameters.class))).thenReturn(execution);

        JobExecutionResponseDto response = batchJobService.runCleanupJob(15);

        assertThat(response).isNotNull();
        assertThat(response.getJobExecutionId()).isEqualTo(10L);
        assertThat(response.getJobName()).isEqualTo("cleanupSoftDeletedJob");
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
        assertThat(response.getExitCode()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Yazar analitik raporlama işi başarıyla başlatılmalı ve DTO dönmeli")
    void shouldRunAuthorAnalyticsJobSuccessfully() throws Exception {
        JobInstance instance = new JobInstance(2L, "authorAnalyticsJob");
        JobExecution execution = new JobExecution(20L, instance, new JobParameters());
        execution.setStatus(BatchStatus.COMPLETED);
        execution.setExitStatus(ExitStatus.COMPLETED);
        execution.setStartTime(LocalDateTime.now().minusSeconds(2));
        execution.setEndTime(LocalDateTime.now());

        when(jobLauncher.run(eq(authorAnalyticsJob), any(JobParameters.class))).thenReturn(execution);

        JobExecutionResponseDto response = batchJobService.runAuthorAnalyticsJob();

        assertThat(response).isNotNull();
        assertThat(response.getJobExecutionId()).isEqualTo(20L);
        assertThat(response.getJobName()).isEqualTo("authorAnalyticsJob");
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Var olan bir Job Execution durumu başarıyla sorgulanmalı")
    void shouldGetJobExecutionStatus() {
        JobInstance instance = new JobInstance(1L, "cleanupSoftDeletedJob");
        JobExecution execution = new JobExecution(100L, instance, new JobParameters());
        execution.setStatus(BatchStatus.COMPLETED);
        execution.setExitStatus(ExitStatus.COMPLETED);

        when(jobExplorer.getJobExecution(100L)).thenReturn(execution);

        JobExecutionResponseDto response = batchJobService.getJobExecution(100L);

        assertThat(response).isNotNull();
        assertThat(response.getJobExecutionId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("Kayıt bulunamadığında BerkeOzderException fırlatılmalı")
    void shouldThrowExceptionWhenExecutionNotFound() {
        when(jobExplorer.getJobExecution(999L)).thenReturn(null);

        assertThatThrownBy(() -> batchJobService.getJobExecution(999L))
                .isInstanceOf(BerkeOzderException.class)
                .hasMessageContaining("İş yürütme kaydı bulunamadı. ID: 999");
    }

    @Test
    @DisplayName("En son oluşturulan yazar analitik raporları yazar listesini dönmeli")
    void shouldReturnLatestAuthorAnalyticsReport() {
        AuthorAnalyticsReportDto report = AuthorAnalyticsReportDto.builder()
                .authorId(1L)
                .username("berke")
                .blogCount(5)
                .build();

        when(authorAnalyticsItemWriter.getCollectedReports()).thenReturn(List.of(report));

        List<AuthorAnalyticsReportDto> result = batchJobService.getLatestAuthorAnalyticsReport();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getUsername()).isEqualTo("berke");
    }
}

