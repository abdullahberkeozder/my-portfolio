package com.berkeozder.controller.api.impl;

import com.berkeozder.business.services.interfaces.IExportService;
import com.berkeozder.controller.api.interfaces.IExportApi;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;

/**
 * Kurumsal Blog Dışa Aktarma ve Raporlama REST API Uygulaması (Adım 13)
 * Excel (.xlsx) ve CSV formatlarında dosya indirme (File Download Streaming) akışı sağlar.
 *
 * @author Berke Özder
 */
@RequiredArgsConstructor
@Log4j2
@RestController
@RequestMapping("/blog/api/v1.0.0/export")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Export & Raporlama API", description = "Blog verilerini Excel (.xlsx) ve CSV formatında dışa aktarma uç noktaları")
public class ExportApiImpl implements IExportApi {

    private final IExportService exportService;

    /**
     * Excel (.xlsx) Blog Raporu İndirme
     * http://localhost:5555/blog/api/v1.0.0/export/excel?include_deleted=false
     */
    @Operation(summary = "Blog listesini Excel (.xlsx) olarak indir",
            description = "Tüm blog kayıtlarını, kategorilerini, yazarlarını, yorum adetlerini ve etiketlerini içeren stilize edilmiş Excel raporu üretir.")
    @GetMapping(value = "/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Override
    public ResponseEntity<InputStreamResource> exportBlogsToExcel(
            @RequestParam(name = "include_deleted", required = false, defaultValue = "false") boolean includeDeleted) {

        log.info("REST: Excel blog raporu talep edildi (include_deleted={})", includeDeleted);
        ByteArrayInputStream stream = exportService.exportBlogsToExcel(includeDeleted);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"blogs_report.xlsx\"");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(stream));
    }

    /**
     * CSV Blog Raporu İndirme (UTF-8 BOM ile Türkçe Karakter Uyumlu)
     * http://localhost:5555/blog/api/v1.0.0/export/csv?include_deleted=false
     */
    @Operation(summary = "Blog listesini CSV olarak indir",
            description = "Tüm blog kayıtlarını UTF-8 BOM destekli (Excel Türkçe karakter uyumlu) CSV formatında dışa aktarır.")
    @GetMapping(value = "/csv", produces = "text/csv; charset=UTF-8")
    @Override
    public ResponseEntity<InputStreamResource> exportBlogsToCsv(
            @RequestParam(name = "include_deleted", required = false, defaultValue = "false") boolean includeDeleted) {

        log.info("REST: CSV blog raporu talep edildi (include_deleted={})", includeDeleted);
        ByteArrayInputStream stream = exportService.exportBlogsToCsv(includeDeleted);

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"blogs_report.csv\"");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(stream));
    }
}

