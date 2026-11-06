package com.berkeozder;

import com.berkeozder.batch.jobs.cleanup.SoftDeletedBlogItemProcessor;
import com.berkeozder.data.entity.BlogEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("SoftDeletedBlogItemProcessor Unit Tests")
class SoftDeletedBlogItemProcessorTest {

    private SoftDeletedBlogItemProcessor processor;

    @BeforeEach
    void setUp() {
        processor = new SoftDeletedBlogItemProcessor();
    }

    @Test
    @DisplayName("Silinmiş olarak işaretlenen blog başarıyla işlenmeli")
    void shouldPassDeletedBlog() {
        BlogEntity blog = BlogEntity.builder()
                .blogId(100L)
                .header("Silinecek Blog")
                .isDeleted(true)
                .deletedAt(new Date())
                .build();

        BlogEntity result = processor.process(blog);

        assertThat(result).isNotNull();
        assertThat(result.getBlogId()).isEqualTo(100L);
        assertThat(result.isDeleted()).isTrue();
    }

    @Test
    @DisplayName("Silinmemiş (isDeleted=false) blog filtrelenmeli (null dönmeli)")
    void shouldFilterOutNonDeletedBlog() {
        BlogEntity blog = BlogEntity.builder()
                .blogId(200L)
                .header("Aktif Blog")
                .isDeleted(false)
                .build();

        BlogEntity result = processor.process(blog);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Null gelen blog nesnesi için null dönmeli")
    void shouldReturnNullWhenBlogIsNull() {
        BlogEntity result = processor.process(null);

        assertThat(result).isNull();
    }
}

