package com.berkeozder.file_upload.minio;

import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.file_upload.FileStorageService;
import com.berkeozder.file_upload.FileStorageServiceImpl;
import io.minio.*;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * MinIO / S3 Uyumlu Cloud-Native Object Storage Servisi (Adım 16)
 * Blog kapak görsellerini ve dosyaları S3 bucket üzerinde güvenle saklar.
 *
 * @author Berke Özder
 */
@Log4j2
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "storage.type", havingValue = "minio")
public class MinioStorageServiceImpl implements FileStorageService {

    private static final List<String> ALLOWED_MIME = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    @PostConstruct
    public void init() {
        try {
            String bucket = minioProperties.getBucketName();
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                log.info("MinIO bucket bulunamadı. Yeni bucket oluşturuluyor: {}", bucket);
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                log.info("MinIO bucket başarıyla oluşturuldu: {}", bucket);
            } else {
                log.info("MinIO bucket doğrulandı: {}", bucket);
            }
        } catch (Exception e) {
            log.error("MinIO başlatma hatası: {}", e.getMessage(), e);
            throw new _400_BadRequestException("MinIO bucket başlatılamadı: " + e.getMessage());
        }
    }

    @Override
    public String store(MultipartFile file, String module) {
        if (file == null || file.isEmpty()) {
            throw new _400_BadRequestException("Yüklenecek dosya boş olamaz.");
        }

        // 1. Modül Güvenlik Doğrulaması (Path Traversal Önleme)
        if (module == null || !module.matches("^[a-zA-Z0-9_-]+$")) {
            throw new _400_BadRequestException("Geçersiz modül adı: " + module);
        }

        // 2. Maksimum Dosya Boyutu Kontrolü (5 MB)
        if (file.getSize() > FileStorageServiceImpl.MAX_FILE_SIZE_BYTES) {
            throw new _400_BadRequestException(String.format(
                    "Dosya boyutu maksimum 5 MB olabilir. Yüklenen boyut: %.2f MB",
                    (double) file.getSize() / (1024 * 1024)
            ));
        }

        // 3. Client Content-Type Kontrolü
        String contentType = file.getContentType();
        if (contentType == null || ALLOWED_MIME.stream().noneMatch(contentType::equalsIgnoreCase)) {
            throw new _400_BadRequestException("Sadece görüntü dosyaları yüklenebilir (jpeg, png, webp, gif).");
        }

        // 4. Magic Bytes (İçerik İmza) Doğrulaması (Sahte Uzantı Koruması)
        byte[] headerBytes = new byte[12];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(headerBytes);
            if (read < 12 || !FileStorageServiceImpl.isValidImageSignature(headerBytes)) {
                throw new _400_BadRequestException("Güvenlik Uyarısı: Dosya içeriği geçerli bir görsel imzası (JPEG, PNG, GIF, WEBP) taşımıyor.");
            }
        } catch (Exception e) {
            throw new _400_BadRequestException("Dosya içeriği okunurken hata oluştu: " + e.getMessage());
        }

        // 5. Güvenli S3 Object Key Oluşturma (module/year/month/day/UUID.ext)
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);
        LocalDate today = LocalDate.now();

        String objectKey = String.format("%s/%d/%02d/%02d/%s",
                module,
                today.getYear(),
                today.getMonthValue(),
                today.getDayOfMonth(),
                filename);

        try (InputStream is = file.getInputStream()) {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(objectKey)
                    .stream(is, file.getSize(), -1)
                    .contentType(contentType)
                    .build());

            String storedUrl = "/minio/" + minioProperties.getBucketName() + "/" + objectKey;
            log.info("Dosya MinIO S3 bucket'ına yüklendi: {}", storedUrl);
            return storedUrl;
        } catch (Exception e) {
            log.error("Dosya MinIO'ya yüklenirken hata oluştu: {}", e.getMessage(), e);
            throw new _400_BadRequestException("Dosya Object Storage'a yüklenemedi: " + e.getMessage());
        }
    }

    @Override
    public void delete(String relativeUrl) {
        if (!StringUtils.hasText(relativeUrl)) {
            return;
        }

        String objectKey = extractObjectKey(relativeUrl);
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(objectKey)
                    .build());
            log.info("Dosya MinIO bucket'ından silindi: {}", objectKey);
        } catch (Exception e) {
            log.warn("MinIO dosya silme hatası: {}", e.getMessage());
        }
    }

    @Override
    public Resource loadAsResource(String relativeUrl) {
        if (!StringUtils.hasText(relativeUrl)) {
            throw new _404_NotFoundException("Geçersiz dosya yolu.");
        }

        String objectKey = extractObjectKey(relativeUrl);
        try {
            InputStream is = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(minioProperties.getBucketName())
                    .object(objectKey)
                    .build());
            return new InputStreamResource(is);
        } catch (Exception e) {
            log.error("MinIO dosya indirme hatası: {}", e.getMessage());
            throw new _404_NotFoundException("Dosya Object Storage'da bulunamadı: " + relativeUrl);
        }
    }

    @Override
    public String getPresignedUrl(String relativeUrl) {
        if (!StringUtils.hasText(relativeUrl)) {
            return relativeUrl;
        }

        String objectKey = extractObjectKey(relativeUrl);
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(minioProperties.getBucketName())
                    .object(objectKey)
                    .expiry(minioProperties.getPresignedExpiryMinutes(), TimeUnit.MINUTES)
                    .build());
        } catch (Exception e) {
            log.warn("Presigned URL üretilemedi, orijinal URL dönülüyor: {}", e.getMessage());
            return relativeUrl;
        }
    }

    @Override
    public String getStorageType() {
        return "MINIO_S3";
    }

    private String extractObjectKey(String relativeUrl) {
        String prefix = "/minio/" + minioProperties.getBucketName() + "/";
        if (relativeUrl.startsWith(prefix)) {
            return relativeUrl.substring(prefix.length());
        }
        return relativeUrl.replaceFirst("^/+", "");
    }

    private String getExtension(String filename) {
        if (!StringUtils.hasText(filename)) return "";
        String clean = Paths.get(filename).getFileName().toString();
        int dot = clean.lastIndexOf('.');
        return (dot >= 0 && dot < clean.length() - 1) ? clean.substring(dot + 1).toLowerCase() : "";
    }
}

