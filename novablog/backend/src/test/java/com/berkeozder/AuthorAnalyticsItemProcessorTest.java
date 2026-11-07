package com.berkeozder;

import com.berkeozder.batch.jobs.analytics.AuthorAnalyticsItemProcessor;
import com.berkeozder.business.dto.batch.AuthorAnalyticsReportDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.UserEntity;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ICommentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthorAnalyticsItemProcessor Unit Tests")
class AuthorAnalyticsItemProcessorTest {

    @Mock
    private IBlogRepository blogRepository;

    @Mock
    private ICommentRepository commentRepository;

    private AuthorAnalyticsItemProcessor processor;

    @BeforeEach
    void setUp() {
        processor = new AuthorAnalyticsItemProcessor(blogRepository, commentRepository);
    }

    @Test
    @DisplayName("Yazarın blogları ve yorumları üzerinden analitik metrikleri doğru hesaplanmalı")
    void shouldCalculateAuthorAnalyticsSuccessfully() {
        UserEntity author = UserEntity.builder()
                .userId(1L)
                .username("berkeozder")
                .firstName("Berke")
                .lastName("Özder")
                .build();

        BlogEntity blog1 = BlogEntity.builder()
                .blogId(10L)
                .header("Spring Boot 2026")
                .content("Spring Boot ile kurumsal mimari geliştirme rehberi ve en iyi pratikler") // 10 kelime
                .author(author)
                .build();

        BlogEntity blog2 = BlogEntity.builder()
                .blogId(20L)
                .header("Spring Batch")
                .content("Spring Batch ile büyük veri işleme ve ETL süreçleri") // 8 kelime
                .author(author)
                .build();

        when(blogRepository.findByAuthor(author)).thenReturn(List.of(blog1, blog2));
        when(commentRepository.countByBlog_BlogId(10L)).thenReturn(3L);
        when(commentRepository.countByBlog_BlogId(20L)).thenReturn(2L);

        AuthorAnalyticsReportDto result = processor.process(author);

        assertThat(result).isNotNull();
        assertThat(result.getAuthorId()).isEqualTo(1L);
        assertThat(result.getUsername()).isEqualTo("berkeozder");
        assertThat(result.getFullName()).isEqualTo("Berke Özder");
        assertThat(result.getBlogCount()).isEqualTo(2);
        assertThat(result.getTotalWordCount()).isEqualTo(20L);
        assertThat(result.getAvgWordCount()).isEqualTo(10.0);
        assertThat(result.getCommentCount()).isEqualTo(5L);
        // Engagement Score = (2 * 10) + (5 * 5) + (20 / 50.0) = 20 + 25 + 0.4 = 45.4
        assertThat(result.getEngagementScore()).isEqualTo(45.4);
    }

    @Test
    @DisplayName("Hiç blogu olmayan kullanıcı için null dönmeli (Filtrelenmeli)")
    void shouldFilterOutUserWithNoBlogs() {
        UserEntity readerUser = UserEntity.builder()
                .userId(2L)
                .username("okuyucu")
                .build();

        when(blogRepository.findByAuthor(readerUser)).thenReturn(Collections.emptyList());

        AuthorAnalyticsReportDto result = processor.process(readerUser);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Null gelen kullanıcı nesnesi için null dönmeli")
    void shouldReturnNullWhenUserIsNull() {
        AuthorAnalyticsReportDto result = processor.process(null);

        assertThat(result).isNull();
    }
}
