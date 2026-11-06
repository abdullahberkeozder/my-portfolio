package com.berkeozder;

import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.file_upload.FileProps;
import com.berkeozder.file_upload.FileStorageServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

public class FileStorageSecurityTest {

    private FileStorageServiceImpl fileStorageService;
    private FileProps fileProps;

    @TempDir
    Path tempDir;

    // Gerçek PNG Magic Bytes başlığı (8 bayt imza + 4 bayt veri)
    private static final byte[] VALID_PNG_BYTES = new byte[]{
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52
    };

    // Gerçek JPEG Magic Bytes başlığı
    private static final byte[] VALID_JPEG_BYTES = new byte[]{
            (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0,
            0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
    };

    @BeforeEach
    void setUp() {
        fileProps = new FileProps();
        fileProps.setUploadDir(tempDir.toString());
        fileStorageService = new FileStorageServiceImpl(fileProps);
        fileStorageService.init();
    }

    @Test
    @DisplayName("Geçerli PNG dosyası başarıyla diske kaydedilmelidir")
    void testStoreValidPng() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.png",
                "image/png",
                VALID_PNG_BYTES
        );

        String relativeUrl = fileStorageService.store(file, "blog");

        assertThat(relativeUrl).isNotNull();
        assertThat(relativeUrl).startsWith("/upload/blog/");
        assertThat(relativeUrl).endsWith(".png");
    }

    @Test
    @DisplayName("Geçerli JPEG dosyası başarıyla diske kaydedilmelidir")
    void testStoreValidJpeg() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cover.jpg",
                "image/jpeg",
                VALID_JPEG_BYTES
        );

        String relativeUrl = fileStorageService.store(file, "blog");

        assertThat(relativeUrl).isNotNull();
        assertThat(relativeUrl).startsWith("/upload/blog/");
        assertThat(relativeUrl).endsWith(".jpg");
    }

    @Test
    @DisplayName("Sahte uzantılı zararlı dosya (Magic Bytes uyuşmazlığı) güvenlik hatası fırlatmalıdır")
    void testStoreSpoofedExtensionThrowsSecurityException() {
        // İçerik düz metin veya zararlı kod ama uzantısı .png yapılmış
        byte[] maliciousBytes = "<?php echo 'malicious code'; ?>".getBytes();

        MockMultipartFile fakePng = new MockMultipartFile(
                "file",
                "trojan.png",
                "image/png",
                maliciousBytes
        );

        assertThatThrownBy(() -> fileStorageService.store(fakePng, "blog"))
                .isInstanceOf(_400_BadRequestException.class)
                .hasMessageContaining("Güvenlik Uyarısı");
    }

    @Test
    @DisplayName("5 MB sınırını aşan dosya yüklendiğinde _400_BadRequestException fırlatılmalıdır")
    void testStoreOversizedFileThrowsBadRequest() {
        // 5.5 MB boyutunda sahte büyük dosya (ilk baytlar PNG olsa bile)
        byte[] oversizedBytes = new byte[6 * 1024 * 1024];
        System.arraycopy(VALID_PNG_BYTES, 0, oversizedBytes, 0, VALID_PNG_BYTES.length);

        MockMultipartFile oversizedFile = new MockMultipartFile(
                "file",
                "big.png",
                "image/png",
                oversizedBytes
        );

        assertThatThrownBy(() -> fileStorageService.store(oversizedFile, "blog"))
                .isInstanceOf(_400_BadRequestException.class)
                .hasMessageContaining("Dosya boyutu maksimum 5 MB olabilir");
    }

    @Test
    @DisplayName("Modül parametresinde Path Traversal denemesi engellenmelidir")
    void testPathTraversalInModuleThrowsBadRequest() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                VALID_PNG_BYTES
        );

        assertThatThrownBy(() -> fileStorageService.store(file, "../../windows/system32"))
                .isInstanceOf(_400_BadRequestException.class)
                .hasMessageContaining("Geçersiz modül adı");
    }

    @Test
    @DisplayName("Var olmayan dosya yüklenmek istendiğinde _404_NotFoundException fırlatılmalıdır")
    void testLoadNonExistentFileThrowsNotFound() {
        assertThatThrownBy(() -> fileStorageService.loadAsResource("/upload/blog/2026/01/01/non-existent.png"))
                .isInstanceOf(_404_NotFoundException.class);
    }

    @Test
    @DisplayName("Path traversal ile dosya okuma denemesi engellenmelidir")
    void testPathTraversalInLoadThrowsBadRequest() {
        assertThatThrownBy(() -> fileStorageService.loadAsResource("/upload/../../windows/system32/cmd.exe"))
                .isInstanceOf(_400_BadRequestException.class)
                .hasMessageContaining("Path traversal");
    }
}
