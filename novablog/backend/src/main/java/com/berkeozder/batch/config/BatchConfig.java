package com.berkeozder.batch.config;

import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemProcessor;
import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemReader;
import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemWriter;
import com.berkeozder.batch.jobs.cleanup.SoftDeletedBlogItemProcessor;
import com.berkeozder.batch.jobs.cleanup.SoftDeletedBlogItemReader;
import com.berkeozder.batch.jobs.cleanup.SoftDeletedBlogItemWriter;
import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.UserEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.parameters.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

@Log4j2
@Configuration
@RequiredArgsConstructor
public class BatchConfig {

    public static final String CLEANUP_SOFT_DELETED_JOB = "cleanupSoftDeletedJob";
    public static final String CLEANUP_SOFT_DELETED_STEP = "cleanupSoftDeletedStep";

    public static final String AUTHOR_ANALYTICS_JOB = "authorAnalyticsJob";
    public static final String AUTHOR_ANALYTICS_STEP = "authorAnalyticsStep";

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final BatchJobExecutionListener jobExecutionListener;

    /// ///////////////////////////////////////////////////////////////////////////////
    // JOB 1: Soft-Deleted Blogları Kalıcı Olarak Temizleme (Cleanup Job)
    /// ///////////////////////////////////////////////////////////////////////////////

    @Bean
    public Step cleanupSoftDeletedStep(
            SoftDeletedBlogItemReader reader,
            SoftDeletedBlogItemProcessor processor,
            SoftDeletedBlogItemWriter writer) {
        return new StepBuilder(CLEANUP_SOFT_DELETED_STEP, jobRepository)
                .<BlogEntity, BlogEntity>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job cleanupSoftDeletedJob(Step cleanupSoftDeletedStep) {
        return new JobBuilder(CLEANUP_SOFT_DELETED_JOB, jobRepository)
                .incrementer(new RunIdIncrementer())
                .listener(jobExecutionListener)
                .start(cleanupSoftDeletedStep)
                .build();
    }

    /// ///////////////////////////////////////////////////////////////////////////////
    // JOB 2: Yazar Etkileşim ve Performans Analitik Raporu (Author Analytics Job)
    /// ///////////////////////////////////////////////////////////////////////////////

    @Bean
    public Step authorAnalyticsStep(
            AuthorAnalyticsItemReader reader,
            AuthorAnalyticsItemProcessor processor,
            AuthorAnalyticsItemWriter writer) {
        return new StepBuilder(AUTHOR_ANALYTICS_STEP, jobRepository)
                .<UserEntity, AuthorAnalyticsReportDto>chunk(10, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public Job authorAnalyticsJob(Step authorAnalyticsStep) {
        return new JobBuilder(AUTHOR_ANALYTICS_JOB, jobRepository)
                .incrementer(new RunIdIncrementer())
                .listener(jobExecutionListener)
                .start(authorAnalyticsStep)
                .build();
    }
}

