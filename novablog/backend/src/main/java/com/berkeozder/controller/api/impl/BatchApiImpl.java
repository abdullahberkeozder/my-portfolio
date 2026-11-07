package com.berkeozder.controller.api.impl;

import com.berkeozder.batch.service.IBatchJobService;
import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.business.dto.batch.JobExecutionResponseDto;
import com.berkeozder.controller.api.interfaces.IBatchApi;
import com.berkeozder.error.ApiResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RestController
@RequestMapping("/api/v1/batch/jobs")
@RequiredArgsConstructor
@CrossOrigin
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Spring Batch ETL & Automation", description = "Büyük ölçekli toplu veri işleme, veri temizliği ve analitik raporlama API")
public class BatchApiImpl implements IBatchApi {

    private final IBatchJobService batchJobService;

    @Override
    @PostMapping("/cleanup")
    @Operation(summary = "Soft-deleted blogları kalıcı olarak temizleyen Batch Job'ı tetikle (Admin)")
    public ResponseEntity<ApiResult<JobExecutionResponseDto>> runCleanupJob(
            @RequestParam(name = "daysOld", required = false, defaultValue = "30") Integer daysOld) {
        log.info("REST: Soft-delete temizleme batch job'ı tetiklendi. Gün eşiği: {}", daysOld);
        JobExecutionResponseDto response = batchJobService.runCleanupJob(daysOld);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @PostMapping("/analytics")
    @Operation(summary = "Yazar etkileşim ve analitik raporlama Batch Job'ını tetikle (Admin)")
    public ResponseEntity<ApiResult<JobExecutionResponseDto>> runAuthorAnalyticsJob() {
        log.info("REST: Yazar analitik raporlama batch job'ı tetiklendi.");
        JobExecutionResponseDto response = batchJobService.runAuthorAnalyticsJob();
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @GetMapping("/{executionId}/status")
    @Operation(summary = "Belirli bir Job Execution durum ve istatistik detayını sorgula (Admin)")
    public ResponseEntity<ApiResult<JobExecutionResponseDto>> getJobExecution(
            @PathVariable("executionId") Long executionId) {
        log.info("REST: Job Execution durumu sorgulanıyor. ID: {}", executionId);
        JobExecutionResponseDto response = batchJobService.getJobExecution(executionId);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @GetMapping("/executions")
    @Operation(summary = "Son yürütülen Batch Job kayıtlarını listele (Admin)")
    public ResponseEntity<ApiResult<List<JobExecutionResponseDto>>> getRecentJobExecutions() {
        log.info("REST: Son yürütülen batch job'lar listeleniyor.");
        List<JobExecutionResponseDto> response = batchJobService.getRecentJobExecutions();
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Override
    @GetMapping("/analytics/report")
    @Operation(summary = "Son oluşturulan yazar analitik rapor verilerini getir (Admin)")
    public ResponseEntity<ApiResult<List<AuthorAnalyticsReportDto>>> getLatestAuthorAnalyticsReport() {
        log.info("REST: En son yazar analitik rapor verileri sorgulanıyor.");
        List<AuthorAnalyticsReportDto> response = batchJobService.getLatestAuthorAnalyticsReport();
        return ResponseEntity.ok(ApiResult.success(response));
    }
}
