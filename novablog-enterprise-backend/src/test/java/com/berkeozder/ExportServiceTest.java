package com.berkeozder;

import com.berkeozder.business.services.impl.ExportServiceImpl;
import com.berkeozder.data.entity.*;
import com.berkeozder.data.repository.IBlogRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class ExportServiceTest {

    @Mock
    private IBlogRepository iBlogRepository;

    @InjectMocks
    private ExportServiceImpl exportService;

    private BlogEntity sampleBlog;
    private BlogCategoryEntity category;
    private UserEntity author;
    private TagEntity tag;

    @BeforeEach
    void setUp() {
        category = BlogCategoryEntity.builder()
                .blogCategoryId(1L)
                .categoryName("Yazılım Mimarisi")
                .build();

        author = UserEntity.builder()
                .userId(1L)
                .username("berke_admin")
                .email("berke@example.com")
                .build();

        tag = TagEntity.builder()
                .tagId(1L)
                .name("spring-boot")
                .blogs(new HashSet<>())
                .build();

        sampleBlog = BlogEntity.builder()
                .blogId(101L)
                .header("Spring Boot ile Excel Export")
                .title("Kurumsal Raporlama Rehberi")
                .content("Detaylı içerik burada yer alır.")
                .blogCategoryEntity(category)
                .author(author)
                .tags(new HashSet<>(Collections.singletonList(tag)))
                .isDeleted(false)
                .build();
        sampleBlog.setCreatedDate(new Date());

        CommentEntity comment = CommentEntity.builder()
                .commentId(1L)
                .content("Harika makale!")
                .blog(sampleBlog)
                .build();
        sampleBlog.setComments(new ArrayList<>(Collections.singletonList(comment)));
    }

    @Test
    @DisplayName("Excel Dışa Aktarma: Geçerli XSSFWorkbook, başlıklar ve hücre verileri üretilmelidir")
    void testExportBlogsToExcel_ShouldCreateValidExcelWorkbook() throws IOException {
        when(iBlogRepository.findAll(any(Sort.class))).thenReturn(Collections.singletonList(sampleBlog));

        ByteArrayInputStream stream = exportService.exportBlogsToExcel(false);
        assertThat(stream).isNotNull();

        try (Workbook workbook = new XSSFWorkbook(stream)) {
            Sheet sheet = workbook.getSheet("Blog Raporu");
            assertThat(sheet).isNotNull();

            // Header Satırı Kontrolü
            Row headerRow = sheet.getRow(0);
            assertThat(headerRow).isNotNull();
            assertThat(headerRow.getCell(0).getStringCellValue()).isEqualTo("ID");
            assertThat(headerRow.getCell(1).getStringCellValue()).isEqualTo("Başlık (Header)");
            assertThat(headerRow.getCell(2).getStringCellValue()).isEqualTo("Alt Başlık (Title)");
            assertThat(headerRow.getCell(3).getStringCellValue()).isEqualTo("Kategori");
            assertThat(headerRow.getCell(4).getStringCellValue()).isEqualTo("Yazar");
            assertThat(headerRow.getCell(5).getStringCellValue()).isEqualTo("Yorum Sayısı");
            assertThat(headerRow.getCell(6).getStringCellValue()).isEqualTo("Etiketler");
            assertThat(headerRow.getCell(7).getStringCellValue()).isEqualTo("Oluşturulma Tarihi");
            assertThat(headerRow.getCell(8).getStringCellValue()).isEqualTo("Durum");

            // 1. Veri Satırı Kontrolü
            Row dataRow = sheet.getRow(1);
            assertThat(dataRow).isNotNull();
            assertThat((long) dataRow.getCell(0).getNumericCellValue()).isEqualTo(101L);
            assertThat(dataRow.getCell(1).getStringCellValue()).isEqualTo("Spring Boot ile Excel Export");
            assertThat(dataRow.getCell(2).getStringCellValue()).isEqualTo("Kurumsal Raporlama Rehberi");
            assertThat(dataRow.getCell(3).getStringCellValue()).isEqualTo("Yazılım Mimarisi");
            assertThat(dataRow.getCell(4).getStringCellValue()).isEqualTo("berke_admin");
            assertThat((int) dataRow.getCell(5).getNumericCellValue()).isEqualTo(1); // 1 yorum
            assertThat(dataRow.getCell(6).getStringCellValue()).contains("#spring-boot");
            assertThat(dataRow.getCell(8).getStringCellValue()).isEqualTo("Aktif");
        }
    }

    @Test
    @DisplayName("Excel Dışa Aktarma: includeDeleted=true olduğunda silinmiş kayıtlar rapora eklenmelidir")
    void testExportBlogsToExcel_WithIncludeDeleted_ShouldIncludeDeletedBlogs() throws IOException {
        BlogEntity deletedBlog = BlogEntity.builder()
                .blogId(102L)
                .header("Eski Blog Başlığı")
                .title("Silinmiş Blog")
                .blogCategoryEntity(category)
                .author(author)
                .isDeleted(true)
                .deletedAt(new Date())
                .build();

        when(iBlogRepository.findAll(any(Sort.class))).thenReturn(Collections.singletonList(sampleBlog));
        when(iBlogRepository.findDeletedBlogsNative()).thenReturn(Collections.singletonList(deletedBlog));

        ByteArrayInputStream stream = exportService.exportBlogsToExcel(true);
        assertThat(stream).isNotNull();

        try (Workbook workbook = new XSSFWorkbook(stream)) {
            Sheet sheet = workbook.getSheet("Blog Raporu");
            assertThat(sheet.getPhysicalNumberOfRows()).isEqualTo(3); // 1 Header + 2 Data rows

            // Silinmiş blogun durumu "Silinmiş" olmalı
            boolean foundDeleted = false;
            for (int r = 1; r <= 2; r++) {
                Row row = sheet.getRow(r);
                if ("Silinmiş".equals(row.getCell(8).getStringCellValue())) {
                    foundDeleted = true;
                    assertThat((long) row.getCell(0).getNumericCellValue()).isEqualTo(102L);
                }
            }
            assertThat(foundDeleted).isTrue();
        }
    }

    @Test
    @DisplayName("CSV Dışa Aktarma: UTF-8 BOM içermeli ve Türkçe karakterleri doğru kodlamalıdır")
    void testExportBlogsToCsv_ShouldProduceUtf8BomAndValidCsv() throws IOException {
        sampleBlog.setHeader("Türkçe Şemsiye & Örnek Çiçek");
        when(iBlogRepository.findAll(any(Sort.class))).thenReturn(Collections.singletonList(sampleBlog));

        ByteArrayInputStream stream = exportService.exportBlogsToCsv(false);
        byte[] bytes = stream.readAllBytes();

        // 1. UTF-8 BOM Doğrulaması (0xEF, 0xBB, 0xBF)
        assertThat(bytes.length).isGreaterThan(3);
        assertThat(bytes[0]).isEqualTo((byte) 0xEF);
        assertThat(bytes[1]).isEqualTo((byte) 0xBB);
        assertThat(bytes[2]).isEqualTo((byte) 0xBF);

        // 2. CSV Metin İçeriği ve Türkçe Karakter Doğrulaması
        String csvContent = new String(bytes, 3, bytes.length - 3, StandardCharsets.UTF_8);

        assertThat(csvContent).contains("ID,Başlık,Alt Başlık,Kategori,Yazar,Yorum Sayısı,Etiketler,Oluşturulma Tarihi,Durum");
        assertThat(csvContent).contains("Türkçe Şemsiye & Örnek Çiçek");
        assertThat(csvContent).contains("Yazılım Mimarisi");
        assertThat(csvContent).contains("berke_admin");
        assertThat(csvContent).contains("Aktif");
    }
}

