package com.berkeozder.file_upload.minio;

import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MinIO S3 İstemci Yapılandırması (Adım 16)
 * Yalnızca storage.type=minio olarak ayarlandığında MinioClient Bean'ini üretir.
 *
 * @author Berke Özder
 */
@Configuration
@RequiredArgsConstructor
@Log4j2
public class MinioConfig {

    private final MinioProperties minioProperties;

    @Bean
    @ConditionalOnProperty(name = "storage.type", havingValue = "minio")
    public MinioClient minioClient() {
        log.info("MinIO S3 Client yapılandırılıyor. Endpoint: {}, Bucket: {}, Region: {}",
                minioProperties.getEndpoint(), minioProperties.getBucketName(), minioProperties.getRegion());

        return MinioClient.builder()
                .endpoint(minioProperties.getEndpoint())
                .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
                .region(minioProperties.getRegion())
                .build();
    }
}

