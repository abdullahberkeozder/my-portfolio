package com.berkeozder.file_upload.minio;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * MinIO / S3 Uyumlu Object Storage Yapılandırma Özellikleri (Adım 16)
 *
 * @author Berke Özder
 */
@Data
@Component
@ConfigurationProperties(prefix = "storage.minio")
public class MinioProperties {

    /**
     * MinIO API sunucu adresi (örn: http://localhost:9000 veya Docker içi http://minio:9000)
     */
    private String endpoint = "http://localhost:9000";

    /**
     * Erişim anahtarı (Access Key / Root User)
     */
    private String accessKey = "minioadmin";

    /**
     * Gizli anahtar (Secret Key / Root Password)
     */
    private String secretKey = "minioadmin";

    /**
     * Blog görselleri ve dosyalarının tutulacağı S3 bucket adı
     */
    private String bucketName = "blog-bucket";

    /**
     * AWS S3 uyumluluğu için bölge adı (varsayılan us-east-1)
     */
    private String region = "us-east-1";

    /**
     * Geçici doğrudan indirme linklerinin (Presigned URL) geçerlilik süresi (dakika)
     */
    private int presignedExpiryMinutes = 60;
}

