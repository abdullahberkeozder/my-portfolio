package com.berkeozder.batch.service;

import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;

import java.util.List;

public interface IBatchJobService {

    JobExecutionResponseDto runCleanupJob(Integer daysOld);

    JobExecutionResponseDto runAuthorAnalyticsJob();

    JobExecutionResponseDto getJobExecution(Long executionId);

    List<JobExecutionResponseDto> getRecentJobExecutions();

    List<AuthorAnalyticsReportDto> getLatestAuthorAnalyticsReport();
}

