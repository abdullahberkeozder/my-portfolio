package com.berkeozder.batch.jobs.analytics;

import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ICommentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.stereotype.Component;

import java.util.List;

@Log4j2
@Component
@RequiredArgsConstructor
public class AuthorAnalyticsItemProcessor implements ItemProcessor<UserEntity, AuthorAnalyticsReportDto> {

    private final IBlogRepository blogRepository;
    private final ICommentRepository commentRepository;

    @Override
    public AuthorAnalyticsReportDto process(UserEntity user) {
        if (user == null) {
            return null;
        }

        List<BlogEntity> blogs = blogRepository.findByAuthor(user);
        if (blogs == null || blogs.isEmpty()) {
            // Yazarın yayınlanmış aktif blogu yoksa raporlamadan filtrele
            return null;
        }

        int blogCount = blogs.size();

        long totalWordCount = blogs.stream()
                .mapToLong(blog -> {
                    if (blog.getContent() == null || blog.getContent().isBlank()) {
                        return 0L;
                    }
                    return blog.getContent().trim().split("\\s+").length;
                })
                .sum();

        double avgWordCount = blogCount > 0 ? (double) totalWordCount / blogCount : 0.0;

        long totalComments = blogs.stream()
                .mapToLong(blog -> commentRepository.countByBlog_BlogId(blog.getBlogId()))
                .sum();

        // Skor algoritması: (Blog Sayısı * 10) + (Yorum Sayısı * 5) + (Kelime Sayısı / 50)
        double engagementScore = (blogCount * 10.0) + (totalComments * 5.0) + (totalWordCount / 50.0);

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (fullName.isBlank()) {
            fullName = user.getUsername();
        }

        log.debug("Yazar analitiği hesaplandı: {} -> {} blog, {} kelime, {} yorum, skor: {}",
                user.getUsername(), blogCount, totalWordCount, totalComments, engagementScore);

        return AuthorAnalyticsReportDto.builder()
                .authorId(user.getUserId())
                .username(user.getUsername())
                .fullName(fullName)
                .blogCount(blogCount)
                .totalWordCount(totalWordCount)
                .avgWordCount(Math.round(avgWordCount * 100.0) / 100.0)
                .commentCount(totalComments)
                .engagementScore(Math.round(engagementScore * 100.0) / 100.0)
                .build();
    }
}

