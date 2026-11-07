package com.berkeozder;

import com.berkeozder.file_upload.minio.MinioProperties;
import com.berkeozder.file_upload.minio.MinioStorageServiceImpl;
import io.minio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class MinioStorageServiceTest {

    @Mock
    private MinioClient minioClient;

    @Mock
    private MinioProperties minioProperties;

    @InjectMocks
    private MinioStorageServiceImpl minioStorageService;

    @BeforeEach
    void setUp() {
        lenient().when(minioProperties.getBucketName()).thenReturn("test-bucket");
        lenient().when(minioProperties.getPresignedExpiryMinutes()).thenReturn(60);
    }

    @Test
    @DisplayName("MinIO Başlatma: Bucket yoksa otomatik olarak oluşturulmalıdır")
    void testInit_WhenBucketDoesNotExist_ShouldCreateBucket() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);

        minioStorageService.init();

        verify(minioClient, times(1)).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    @DisplayName("MinIO Başlatma: Bucket zaten varsa tekrar oluşturulmamalıdır")
    void testInit_WhenBucketExists_ShouldNotCreateBucket() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        minioStorageService.init();

        verify(minioClient, never()).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    @DisplayName("MinIO Dosya Yükleme: Geçerli JPEG dosyası bucket'a yüklenmeli ve /minio/... formatında URL dönmelidir")
    void testStore_ShouldUploadFileAndReturnMinioUrl() throws Exception {
        // Geçerli JPEG Magic Bytes: FF D8 FF E0 ...
        byte[] validJpegContent = new byte[]{
                (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
                0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
        };

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.jpg",
                "image/jpeg",
                validJpegContent
        );

        String resultUrl = minioStorageService.store(file, "blog");

        assertThat(resultUrl).startsWith("/minio/test-bucket/blog/");
        assertThat(resultUrl).endsWith(".jpg");
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    @DisplayName("MinIO Dosya Silme: URL'den object key çözülüp removeObject çağrılmalıdır")
    void testDelete_ShouldRemoveObjectFromMinio() throws Exception {
        String fileUrl = "/minio/test-bucket/blog/2026/11/06/test-uuid.jpg";

        minioStorageService.delete(fileUrl);

        verify(minioClient, times(1)).removeObject(any(RemoveObjectArgs.class));
    }

    @Test
    @DisplayName("MinIO Presigned URL: S3 doğrudan indirme bağlantısı üretilmelidir")
    void testGetPresignedUrl_ShouldReturnS3PresignedUrl() throws Exception {
        String expectedPresignedUrl = "http://localhost:9000/test-bucket/blog/test.jpg?X-Amz-Signature=xyz123";
        when(minioClient.getPresignedObjectUrl(any(GetPresignedObjectUrlArgs.class))).thenReturn(expectedPresignedUrl);

        String result = minioStorageService.getPresignedUrl("/minio/test-bucket/blog/test.jpg");

        assertThat(result).isEqualTo(expectedPresignedUrl);
    }

    @Test
    @DisplayName("MinIO Depolama Tipi: MINIO_S3 olarak bildirilmelidir")
    void testGetStorageType_ShouldReturnMinioS3() {
        assertThat(minioStorageService.getStorageType()).isEqualTo("MINIO_S3");
    }
}

