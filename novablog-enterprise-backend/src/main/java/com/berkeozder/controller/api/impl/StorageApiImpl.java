package com.berkeozder.controller.api.impl;

import com.berkeozder.error.ApiResult;
import com.berkeozder.file_upload.FileStorageService;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Dosya Depolama ve Object Storage REST API Uç Noktaları (Adım 16)
 *
 * @author Berke Özder
 */
@RestController
@RequestMapping("/blog/api/v1.0.0/storage")
@RequiredArgsConstructor
@Log4j2
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Storage & Object Storage API", description = "Dosya depolama durumu ve S3 Presigned URL uç noktaları")
public class StorageApiImpl {

    private final FileStorageService fileStorageService;

    @Operation(summary = "Aktif Depolama Stratejisi Bilgisi",
            description = "Sistemin yerel disk (LOCAL) mi yoksa MinIO S3 Object Storage mı kullandığını döner.")
    @GetMapping("/info")
    public ResponseEntity<ApiResult<Map<String, String>>> getStorageInfo() {
        Map<String, String> info = Map.of(
                "storageType", fileStorageService.getStorageType(),
                "status", "ACTIVE"
        );
        return ResponseEntity.ok(ApiResult.success(info));
    }

    @Operation(summary = "Presigned URL Üret",
            description = "Object Storage üzerinde saklanan dosyalar için güvenli, süreli doğrudan indirme bağlantısı (Presigned URL) üretir.")
    @GetMapping("/presigned")
    public ResponseEntity<ApiResult<Map<String, String>>> getPresignedUrl(@RequestParam("url") String relativeUrl) {
        String presignedUrl = fileStorageService.getPresignedUrl(relativeUrl);
        return ResponseEntity.ok(ApiResult.success(Map.of("presignedUrl", presignedUrl)));
    }

    @Operation(summary = "Dosya İndir / Görüntüle",
            description = "Saklanan dosyayı doğrudan HTTP akışı olarak istemciye iletir.")
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam("url") String relativeUrl) {
        Resource resource = fileStorageService.loadAsResource(relativeUrl);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}

