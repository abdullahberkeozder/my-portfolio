package com.berkeozder;

import com.berkeozder.business.dto.BlogFilterRequestDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.specification.BlogSpecification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.jpa.domain.Specification;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

public class BlogSpecificationTest {

    @Test
    @DisplayName("fromFilter null parametre ile çağrıldığında boş olmayan Specification dönmelidir")
    void testFromFilter_WithNull_ShouldReturnConjunction() {
        Specification<BlogEntity> spec = BlogSpecification.fromFilter(null);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("fromFilter tüm parametreler doluyken geçerli Specification üretmelidir")
    void testFromFilter_WithAllFields_ShouldProduceCombinedSpecification() {
        BlogFilterRequestDto filter = BlogFilterRequestDto.builder()
                .search("Spring Boot")
                .categoryId(1L)
                .categoryName("Yazılım")
                .tags(Arrays.asList("java", "spring"))
                .author("admin")
                .startDate(new Date(System.currentTimeMillis() - 86400000L))
                .endDate(new Date())
                .minCommentCount(2)
                .hasImage(true)
                .build();

        Specification<BlogEntity> spec = BlogSpecification.fromFilter(filter);
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("filterBy klasik 4 parametreli metot geriye dönük uyumlu çalışmalıdır")
    void testFilterBy_ShouldReturnValidSpecification() {
        Specification<BlogEntity> spec = BlogSpecification.filterBy("java", 1L, "spring", "admin");
        assertThat(spec).isNotNull();
    }

    @Test
    @DisplayName("Modüler with* Specification yardımcı metotları null güvenli olmalıdır")
    void testModularSpecifications_ShouldBeNullSafe() {
        assertThat(BlogSpecification.withSearch(null)).isNotNull();
        assertThat(BlogSpecification.withSearch("   ")).isNotNull();
        assertThat(BlogSpecification.withCategoryId(null)).isNotNull();
        assertThat(BlogSpecification.withCategoryId(-1L)).isNotNull();
        assertThat(BlogSpecification.withCategoryName(null)).isNotNull();
        assertThat(BlogSpecification.withTags(null)).isNotNull();
        assertThat(BlogSpecification.withTags(Collections.emptyList())).isNotNull();
        assertThat(BlogSpecification.withAuthor(null)).isNotNull();
        assertThat(BlogSpecification.withDateRange(null, null)).isNotNull();
        assertThat(BlogSpecification.withMinCommentCount(null)).isNotNull();
        assertThat(BlogSpecification.withMinCommentCount(-5)).isNotNull();
        assertThat(BlogSpecification.withHasImage(null)).isNotNull();
    }
}

