package com.berkeozder.batch.jobs.analytics;

import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import lombok.Getter;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Log4j2
@Component
public class AuthorAnalyticsItemWriter implements ItemWriter<AuthorAnalyticsReportDto> {

    @Getter
    private final List<AuthorAnalyticsReportDto> collectedReports = new CopyOnWriteArrayList<>();

    private static final String REPORT_DIR = "reports";
    private static final String REPORT_FILE = "reports/author_analytics.csv";

    @Override
    public void write(Chunk<? extends AuthorAnalyticsReportDto> chunk) throws Exception {
        if (chunk == null || chunk.isEmpty()) {
            return;
        }

        List<? extends AuthorAnalyticsReportDto> items = chunk.getItems();
        log.info("Yazar analitik raporu chunk yazılıyor: {} yazar verisi işlendi.", items.size());

        collectedReports.addAll(items);

        // CSV dosyasına yazma / ekleme
        writeToCsv(items);

        for (AuthorAnalyticsReportDto item : items) {
            log.info("-> Yazar: {} (@{}) | Blog: {} | Yorum: {} | Skor: {}",
                    item.getFullName(), item.getUsername(), item.getBlogCount(), item.getCommentCount(), item.getEngagementScore());
        }
    }

    private synchronized void writeToCsv(List<? extends AuthorAnalyticsReportDto> items) {
        try {
            File dir = new File(REPORT_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            File file = new File(REPORT_FILE);
            boolean isNewFile = !file.exists();

            try (PrintWriter writer = new PrintWriter(new FileWriter(file, StandardCharsets.UTF_8, true))) {
                if (isNewFile) {
                    writer.println("AuthorID,Username,FullName,BlogCount,TotalWordCount,AvgWordCount,CommentCount,EngagementScore");
                }
                for (AuthorAnalyticsReportDto item : items) {
                    writer.printf("%d,\"%s\",\"%s\",%d,%d,%.2f,%d,%.2f%n",
                            item.getAuthorId(),
                            item.getUsername(),
                            item.getFullName(),
                            item.getBlogCount(),
                            item.getTotalWordCount(),
                            item.getAvgWordCount(),
                            item.getCommentCount(),
                            item.getEngagementScore());
                }
            }
        } catch (IOException e) {
            log.error("Yazar analitik CSV raporu yazılırken hata oluştu: {}", e.getMessage(), e);
        }
    }

    public void clearCollectedReports() {
        collectedReports.clear();
    }
}

