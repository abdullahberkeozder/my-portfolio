package com.berkeozder.batch.jobs.cleanup;

import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ICommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Log4j2
@Component
@RequiredArgsConstructor
public class SoftDeletedBlogItemWriter implements ItemWriter<BlogEntity> {

    private final IBlogRepository blogRepository;
    private final ICommentRepository commentRepository;

    @Override
    @Transactional
    public void write(Chunk<? extends BlogEntity> chunk) {
        if (chunk == null || chunk.isEmpty()) {
            return;
        }

        List<Long> blogIds = chunk.getItems().stream()
                .map(BlogEntity::getBlogId)
                .toList();

        log.info("Chunk yazma başlatılıyor: {} adet soft-deleted blog kalıcı olarak temizlenecek. ID'ler: {}",
                blogIds.size(), blogIds);

        // 1. İlişkili yorumları (comments) temizle
        int deletedComments = commentRepository.deleteCommentsByBlogIdsNative(blogIds);
        log.debug("Temizlenen ilişkili yorum sayısı: {}", deletedComments);

        // 2. İlişkili etiket eşleşmelerini (blog_tags) temizle
        int deletedTags = blogRepository.deleteBlogTagsByBlogIdsNative(blogIds);
        log.debug("Temizlenen ilişkili etiket bağlantı sayısı: {}", deletedTags);

        // 3. Blog kayıtlarını kalıcı olarak sil (hard-delete)
        int deletedBlogs = blogRepository.bulkHardDeleteNative(blogIds);
        log.info("Chunk temizliği başarıyla tamamlandı. Kalıcı silinen blog sayısı: {}", deletedBlogs);
    }
}

