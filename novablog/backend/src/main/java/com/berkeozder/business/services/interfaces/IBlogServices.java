package com.berkeozder.business.services.interfaces;

import com.berkeozder.business.dto.common.PagedResponseDto;
import com.berkeozder.business.services.*;

// D: Dto
// E: Entity
public interface IBlogServices<D,E> extends
        IModelMapperService<D,E>,
        ISpeedAndDeleteService<D,E>,
        ICrudService<D,E>,
        IImageService<D,E>,
        ISortingPagingService<D,E> {

    PagedResponseDto<D> searchBlogs(
            String search,
            Long categoryId,
            String tagName,
            String authorUsername,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    PagedResponseDto<D> filterBlogs(com.berkeozder.business.dto.BlogFilterRequestDto filterRequest);

    D restoreBlog(Long id);

    java.util.List<D> findDeletedBlogs();

    java.util.List<D> findSoftDeletedBlogsInRetention(int retentionDays);

    com.berkeozder.business.dto.bulk.BulkOperationResponseDto executeBulkOperation(com.berkeozder.business.dto.bulk.BulkOperationRequestDto request);

    // Concurrency & Engagement (Write-Behind Metrics - Adım 24)
    long recordView(Long id);

    long recordLike(Long id);

    long removeLike(Long id);

    long getLiveViews(Long id);

    long getLiveLikes(Long id);

    void flushMetrics();
}
