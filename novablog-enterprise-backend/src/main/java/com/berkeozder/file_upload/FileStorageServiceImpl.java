package com.berkeozder.file_upload;

import com.berkeozder.exception._400_BadRequestException;
import com.berkeozder.exception._404_NotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Log4j2
@Service
@RequiredArgsConstructor
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class FileStorageServiceImpl implements FileStorageService {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final List<String> ALLOWED_MIME = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final FileProps fileProps;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(fileProps.getUploadRoot());
        } catch (IOException e) {
            log.error("Upload klasörü oluşturulamadı: {}", e.getMessage());
            throw new _400_BadRequestException("Upload klasörü oluşturulamadı: " + e.getMessage());
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
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
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
            if (read < 12 || !isValidImageSignature(headerBytes)) {
                throw new _400_BadRequestException("Güvenlik Uyarısı: Dosya içeriği geçerli bir görsel imzası (JPEG, PNG, GIF, WEBP) taşımıyor. Dosya bozuk veya sahte uzantılı.");
            }
        } catch (IOException e) {
            throw new _400_BadRequestException("Dosya içeriği okunurken hata oluştu: " + e.getMessage());
        }

        // 5. Güvenli Dosya Adlandırma (UUID)
        String ext = getExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID() + (ext.isEmpty() ? "" : "." + ext);

        LocalDate today = LocalDate.now();
        Path targetDir = fileProps.getUploadRoot().resolve(Paths.get(
                module,
                String.valueOf(today.getYear()),
                String.format("%02d", today.getMonthValue()),
                String.format("%02d", today.getDayOfMonth())
        )).normalize();

        try {
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(filename).normalize();

            // Hedef yolun upload kök dizini içinde kaldığını doğrula
            if (!target.startsWith(fileProps.getUploadRoot())) {
                throw new _400_BadRequestException("Güvenlik Uyarısı: Path traversal teşebbüsü tespit edildi.");
            }

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            log.info("Dosya güvenle yüklendi: {}", target);
        } catch (IOException e) {
            log.error("Dosya kaydedilirken hata oluştu: {}", e.getMessage());
            throw new _400_BadRequestException("Dosya kaydedilirken hata oluştu: " + e.getMessage());
        }

        // Veritabanına kaydedilecek relative URL:
        return "/upload/" + module + "/" + today.getYear() + "/"
                + String.format("%02d", today.getMonthValue()) + "/"
                + String.format("%02d", today.getDayOfMonth()) + "/" + filename;
    }

    @Override
    public void delete(String relativeUrl) {
        if (relativeUrl == null || !relativeUrl.startsWith("/upload/")) return;

        Path filePath = relativeToFileSystem(relativeUrl);
        try {
            Files.deleteIfExists(filePath);
            log.info("Dosya başarıyla silindi: {}", filePath);
        } catch (IOException e) {
            log.error("Dosya silinemedi: {}, Hata: {}", relativeUrl, e.getMessage());
            throw new _400_BadRequestException("Dosya silinemedi: " + relativeUrl);
        }
    }

    @Override
    public Resource loadAsResource(String relativeUrl) {
        if (relativeUrl == null || !relativeUrl.startsWith("/upload/")) {
            throw new _404_NotFoundException("Geçersiz dosya yolu.");
        }
        Path file = relativeToFileSystem(relativeUrl);
        if (!Files.exists(file)) {
            throw new _404_NotFoundException("Dosya bulunamadı: " + relativeUrl);
        }
        return new FileSystemResource(file.toFile());
    }

    private Path relativeToFileSystem(String relativeUrl) {
        String subpath = relativeUrl.replaceFirst("^/upload/", "").replaceFirst("^/+", "");
        Path absolute = fileProps.getUploadRoot().resolve(subpath).normalize();
        if (!absolute.startsWith(fileProps.getUploadRoot())) {
            throw new _400_BadRequestException("Güvenlik Uyarısı: Path traversal teşebbüsü tespit edildi.");
        }
        return absolute;
    }

    private String getExtension(String filename) {
        if (!StringUtils.hasText(filename)) return "";
        String clean = Paths.get(filename).getFileName().toString();
        int dot = clean.lastIndexOf('.');
        return (dot >= 0 && dot < clean.length() - 1) ? clean.substring(dot + 1).toLowerCase() : "";
    }

    /**
     * Dosya başlık baytlarını (Magic Bytes) kontrol eder.
     * JPEG, PNG, GIF, WEBP formatlarını doğrular.
     */
    public static boolean isValidImageSignature(byte[] header) {
        if (header == null || header.length < 12) {
            return false;
        }

        // JPEG: FF D8 FF
        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return true;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ((header[0] & 0xFF) == 0x89 && (header[1] & 0xFF) == 0x50 &&
            (header[2] & 0xFF) == 0x4E && (header[3] & 0xFF) == 0x47 &&
            (header[4] & 0xFF) == 0x0D && (header[5] & 0xFF) == 0x0A &&
            (header[6] & 0xFF) == 0x1A && (header[7] & 0xFF) == 0x0A) {
            return true;
        }

        // GIF: 47 49 46 38 ("GIF87a" or "GIF89a")
        if (header[0] == 'G' && header[1] == 'I' && header[2] == 'F' && header[3] == '8' &&
            (header[4] == '7' || header[4] == '9') && header[5] == 'a') {
            return true;
        }

        // WEBP: "RIFF" .... "WEBP"
        if (header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F' &&
            header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P') {
            return true;
        }

        return false;
    }
}
