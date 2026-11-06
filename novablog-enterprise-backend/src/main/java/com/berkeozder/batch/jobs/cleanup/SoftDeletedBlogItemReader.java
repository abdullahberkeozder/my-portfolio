package com.berkeozder.batch.jobs.cleanup;

import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogRepository;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.infrastructure.item.ItemReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Log4j2
@Component
@StepScope
public class SoftDeletedBlogItemReader implements ItemReader<BlogEntity> {

    private final IBlogRepository blogRepository;
    private final Long cutoffTimeMillis;
    private Iterator<BlogEntity> blogIterator;
    private boolean initialized = false;

    public SoftDeletedBlogItemReader(
            IBlogRepository blogRepository,
            @Value("#{jobParameters['cutoffTimeMillis']}") Long cutoffTimeMillis) {
        this.blogRepository = blogRepository;
        this.cutoffTimeMillis = cutoffTimeMillis;
    }

    @Override
    public BlogEntity read() {
        if (!initialized) {
            Date cutoffDate = (cutoffTimeMillis != null)
                    ? new Date(cutoffTimeMillis)
                    : new Date(System.currentTimeMillis() - (30L * 24 * 60 * 60 * 1000L)); // Varsayılan: 30 gün öncesi

            log.info("SoftDeletedBlogItemReader başlatılıyor. Eşik tarihi (cutoffDate): {}", cutoffDate);
            List<BlogEntity> deletedBlogs = blogRepository.findSoftDeletedBlogsOlderThanNative(cutoffDate);
            log.info("Temizleme kriterine uyan soft-deleted blog sayısı: {}", deletedBlogs.size());

            this.blogIterator = deletedBlogs.iterator();
            this.initialized = true;
        }

        if (blogIterator != null && blogIterator.hasNext()) {
            return blogIterator.next();
        }
        return null; // Spring Batch: null değeri verinin sonuna gelindiğini belirtir (EOF)
    }
}

