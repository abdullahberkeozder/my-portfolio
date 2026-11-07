package com.berkeozder.controller.api.interfaces;

import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;
import com.berkeozder.error.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "Spring Batch ETL & Automation", description = "Büyük ölçekli toplu veri işleme, veri temizliği ve analitik raporlama API")
public interface IBatchApi {

    @Operation(summary = "Soft-deleted blogları kalıcı olarak temizleyen Batch Job'ı tetikle (Admin)")
    ResponseEntity<ApiResult<JobExecutionResponseDto>> runCleanupJob(Integer daysOld);

    @Operation(summary = "Yazar etkileşim ve analitik raporlama Batch Job'ını tetikle (Admin)")
    ResponseEntity<ApiResult<JobExecutionResponseDto>> runAuthorAnalyticsJob();

    @Operation(summary = "Belirli bir Job Execution durum ve istatistik detayını sorgula (Admin)")
    ResponseEntity<ApiResult<JobExecutionResponseDto>> getJobExecution(Long executionId);

    @Operation(summary = "Son yürütülen Batch Job kayıtlarını listele (Admin)")
    ResponseEntity<ApiResult<List<JobExecutionResponseDto>>> getRecentJobExecutions();

    @Operation(summary = "Son oluşturulan yazar analitik rapor verilerini getir (Admin)")
    ResponseEntity<ApiResult<List<AuthorAnalyticsReportDto>>> getLatestAuthorAnalyticsReport();
}
