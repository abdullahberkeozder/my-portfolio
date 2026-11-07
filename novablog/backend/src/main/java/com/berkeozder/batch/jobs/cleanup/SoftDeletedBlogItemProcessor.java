package com.berkeozder.batch.jobs.cleanup;

import com.berkeozder.data.entity.BlogEntity;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Log4j2
@Component
public class SoftDeletedBlogItemProcessor implements ItemProcessor<BlogEntity, BlogEntity> {

    @Override
    public BlogEntity process(BlogEntity blog) {
        if (blog == null) {
            return null;
        }

        // Güvenlik doğrulaması: Blog gerçekten silinmiş mi?
        if (!blog.isDeleted()) {
            log.warn("Blog [ID: {}] silinmiş olarak işaretlenmemiş, temizlik işleminden atlanıyor (Filtered).", blog.getBlogId());
            return null; // Spring Batch: null dönüldüğünde bu öğe chunk yazma aşamasından filtrelenir
        }

        log.debug("Kalıcı silme (hard-delete) için doğrulandı: Blog ID={}, Başlık='{}', Silinme Tarihi={}",
                blog.getBlogId(), blog.getHeader(), blog.getDeletedAt());

        return blog;
    }
}

