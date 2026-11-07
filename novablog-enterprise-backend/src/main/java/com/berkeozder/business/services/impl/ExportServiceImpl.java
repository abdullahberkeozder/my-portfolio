package com.berkeozder.business.services.impl;

import com.berkeozder.business.services.interfaces.IExportService;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Kurumsal Blog Dışa Aktarma ve Raporlama Servisi Uygulaması (Adım 13)
 * Apache POI (XSSFWorkbook) ile stilize Excel (.xlsx) ve UTF-8 BOM destekli CSV raporları üretir.
 *
 * @author Berke Özder
 */
@Service
@RequiredArgsConstructor
@Log4j2
public class ExportServiceImpl implements IExportService {

    private final IBlogRepository iBlogRepository;

    private static final String[] EXCEL_COLUMNS = {
            "ID", "Başlık (Header)", "Alt Başlık (Title)", "Kategori",
            "Yazar", "Yorum Sayısı", "Etiketler", "Oluşturulma Tarihi", "Durum"
    };

    /**
     * Blog verilerini Microsoft Excel (.xlsx) formatında üretir.
     */
    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportBlogsToExcel(boolean includeDeleted) {
        log.info("Excel blog raporu oluşturuluyor (includeDeleted: {})", includeDeleted);

        List<BlogEntity> blogs = fetchBlogs(includeDeleted);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Blog Raporu");
            sheet.setDisplayGridlines(true);

            // 1. Başlık Stili (Header Style)
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerFont.setColor(IndexedColors.WHITE.getIndex());

            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerCellStyle.setAlignment(HorizontalAlignment.CENTER);
            headerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            headerCellStyle.setBorderTop(BorderStyle.THIN);
            headerCellStyle.setBorderBottom(BorderStyle.THIN);
            headerCellStyle.setBorderLeft(BorderStyle.THIN);
            headerCellStyle.setBorderRight(BorderStyle.THIN);

            // 2. Standart Hücre Stilleri
            CellStyle standardCellStyle = workbook.createCellStyle();
            applyBorders(standardCellStyle);
            standardCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle centerCellStyle = workbook.createCellStyle();
            applyBorders(centerCellStyle);
            centerCellStyle.setAlignment(HorizontalAlignment.CENTER);
            centerCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle numberCellStyle = workbook.createCellStyle();
            applyBorders(numberCellStyle);
            numberCellStyle.setAlignment(HorizontalAlignment.RIGHT);
            numberCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle dateCellStyle = workbook.createCellStyle();
            applyBorders(dateCellStyle);
            dateCellStyle.setAlignment(HorizontalAlignment.CENTER);
            dateCellStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            CreationHelper createHelper = workbook.getCreationHelper();
            dateCellStyle.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));

            // 3. Durum Stilleri (Aktif / Silinmiş)
            Font activeFont = workbook.createFont();
            activeFont.setColor(IndexedColors.DARK_GREEN.getIndex());
            activeFont.setBold(true);
            CellStyle activeStyle = workbook.createCellStyle();
            applyBorders(activeStyle);
            activeStyle.setAlignment(HorizontalAlignment.CENTER);
            activeStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            activeStyle.setFont(activeFont);

            Font deletedFont = workbook.createFont();
            deletedFont.setColor(IndexedColors.RED.getIndex());
            deletedFont.setItalic(true);
            CellStyle deletedStyle = workbook.createCellStyle();
            applyBorders(deletedStyle);
            deletedStyle.setAlignment(HorizontalAlignment.CENTER);
            deletedStyle.setVerticalAlignment(VerticalAlignment.CENTER);
            deletedStyle.setFont(deletedFont);

            // 4. Header Satırını Oluştur
            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(26);
            for (int col = 0; col < EXCEL_COLUMNS.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(EXCEL_COLUMNS[col]);
                cell.setCellStyle(headerCellStyle);
            }

            // 5. Veri Satırlarını Doldur
            int rowIdx = 1;
            for (BlogEntity blog : blogs) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(20);

                // 0: ID
                Cell cellId = row.createCell(0);
                if (blog.getBlogId() != null) {
                    cellId.setCellValue(blog.getBlogId());
                }
                cellId.setCellStyle(numberCellStyle);

                // 1: Başlık (Header)
                Cell cellHeader = row.createCell(1);
                cellHeader.setCellValue(blog.getHeader() != null ? blog.getHeader() : "");
                cellHeader.setCellStyle(standardCellStyle);

                // 2: Alt Başlık (Title)
                Cell cellTitle = row.createCell(2);
                cellTitle.setCellValue(blog.getTitle() != null ? blog.getTitle() : "");
                cellTitle.setCellStyle(standardCellStyle);

                // 3: Kategori
                Cell cellCategory = row.createCell(3);
                String categoryName = blog.getBlogCategoryEntity() != null ? blog.getBlogCategoryEntity().getCategoryName() : "Genel";
                cellCategory.setCellValue(categoryName != null ? categoryName : "");
                cellCategory.setCellStyle(standardCellStyle);

                // 4: Yazar
                Cell cellAuthor = row.createCell(4);
                String authorName = blog.getAuthor() != null ? blog.getAuthor().getUsername() :
                        (blog.getCreatedBy() != null ? blog.getCreatedBy() : "Anonim");
                cellAuthor.setCellValue(authorName);
                cellAuthor.setCellStyle(standardCellStyle);

                // 5: Yorum Sayısı
                Cell cellComments = row.createCell(5);
                cellComments.setCellValue(safeCommentCount(blog));
                cellComments.setCellStyle(numberCellStyle);

                // 6: Etiketler
                Cell cellTags = row.createCell(6);
                cellTags.setCellValue(safeTagsString(blog));
                cellTags.setCellStyle(standardCellStyle);

                // 7: Oluşturulma Tarihi
                Cell cellDate = row.createCell(7);
                if (blog.getCreatedDate() != null) {
                    cellDate.setCellValue(blog.getCreatedDate());
                    cellDate.setCellStyle(dateCellStyle);
                } else {
                    cellDate.setCellValue("-");
                    cellDate.setCellStyle(centerCellStyle);
                }

                // 8: Durum
                Cell cellStatus = row.createCell(8);
                if (blog.isDeleted()) {
                    cellStatus.setCellValue("Silinmiş");
                    cellStatus.setCellStyle(deletedStyle);
                } else {
                    cellStatus.setCellValue("Aktif");
                    cellStatus.setCellStyle(activeStyle);
                }
            }

            // 6. Sütun Genişliklerini Otomatik Ayarla (Auto-size)
            for (int i = 0; i < EXCEL_COLUMNS.length; i++) {
                sheet.autoSizeColumn(i);
                int currentWidth = sheet.getColumnWidth(i);
                sheet.setColumnWidth(i, Math.max(currentWidth + 1024, 3200));
            }

            // 7. Filtreleme (AutoFilter) Aç
            if (rowIdx > 1) {
                sheet.setAutoFilter(new CellRangeAddress(0, rowIdx - 1, 0, EXCEL_COLUMNS.length - 1));
            }

            workbook.write(out);
            log.info("Excel blog raporu oluşturuldu. Toplam satır: {}", blogs.size());
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            log.error("Excel raporu oluşturulurken hata meydana geldi: {}", e.getMessage(), e);
            throw new RuntimeException("Excel raporu oluşturulamadı: " + e.getMessage(), e);
        }
    }

    /**
     * Blog verilerini UTF-8 BOM destekli (Türkçe karakter uyumlu) CSV formatında üretir.
     */
    @Override
    @Transactional(readOnly = true)
    public ByteArrayInputStream exportBlogsToCsv(boolean includeDeleted) {
        log.info("CSV blog raporu oluşturuluyor (includeDeleted: {})", includeDeleted);

        List<BlogEntity> blogs = fetchBlogs(includeDeleted);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Excel'in Türkçe karakterleri düzgün açması için UTF-8 BOM (0xEF, 0xBB, 0xBF) yazılır
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);

            try (PrintWriter writer = new PrintWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8))) {
                // Header satırı
                writer.println("ID,Başlık,Alt Başlık,Kategori,Yazar,Yorum Sayısı,Etiketler,Oluşturulma Tarihi,Durum");

                SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

                for (BlogEntity blog : blogs) {
                    String idStr = blog.getBlogId() != null ? String.valueOf(blog.getBlogId()) : "";
                    String headerStr = escapeCsv(blog.getHeader());
                    String titleStr = escapeCsv(blog.getTitle());
                    String categoryStr = escapeCsv(blog.getBlogCategoryEntity() != null ? blog.getBlogCategoryEntity().getCategoryName() : "Genel");
                    String authorStr = escapeCsv(blog.getAuthor() != null ? blog.getAuthor().getUsername() :
                            (blog.getCreatedBy() != null ? blog.getCreatedBy() : "Anonim"));
                    String commentCountStr = String.valueOf(safeCommentCount(blog));
                    String tagsStr = escapeCsv(safeTagsString(blog));
                    String dateStr = blog.getCreatedDate() != null ? dateFormat.format(blog.getCreatedDate()) : "-";
                    String statusStr = blog.isDeleted() ? "Silinmiş" : "Aktif";

                    writer.printf("%s,%s,%s,%s,%s,%s,%s,%s,%s%n",
                            idStr, headerStr, titleStr, categoryStr, authorStr, commentCountStr, tagsStr, dateStr, statusStr);
                }
                writer.flush();
            }

            log.info("CSV blog raporu oluşturuldu. Toplam satır: {}", blogs.size());
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            log.error("CSV raporu oluşturulurken hata meydana geldi: {}", e.getMessage(), e);
            throw new RuntimeException("CSV raporu oluşturulamadı: " + e.getMessage(), e);
        }
    }

    private List<BlogEntity> fetchBlogs(boolean includeDeleted) {
        List<BlogEntity> blogs = new ArrayList<>(iBlogRepository.findAll(Sort.by(Sort.Direction.DESC, "blogId")));
        if (includeDeleted) {
            List<BlogEntity> deletedBlogs = iBlogRepository.findDeletedBlogsNative();
            blogs.addAll(deletedBlogs);
            blogs.sort((b1, b2) -> Long.compare(
                    b2.getBlogId() != null ? b2.getBlogId() : 0L,
                    b1.getBlogId() != null ? b1.getBlogId() : 0L));
        }
        return blogs;
    }

    private void applyBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private int safeCommentCount(BlogEntity blog) {
        try {
            return blog.getComments() != null ? blog.getComments().size() : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private String safeTagsString(BlogEntity blog) {
        try {
            if (blog.getTags() == null || blog.getTags().isEmpty()) {
                return "-";
            }
            return blog.getTags().stream()
                    .map(tag -> tag.getName().startsWith("#") ? tag.getName() : "#" + tag.getName())
                    .collect(Collectors.joining(", "));
        } catch (Exception e) {
            return "-";
        }
    }

    private String escapeCsv(String data) {
        if (data == null) {
            return "\"\"";
        }
        String escaped = data.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }
}
