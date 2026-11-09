package com.berkeozder.business.services.impl;

import com.berkeozder.ai.client.IAiEmbeddingClient;
import com.berkeozder.ai.vector.VectorUtils;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.BlogFilterRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationResponseDto;
import com.berkeozder.business.dto.common.PagedResponseDto;
import com.berkeozder.business.event.BlogCreatedEvent;
import com.berkeozder.business.metrics.BlogMetricFlushScheduler;
import com.berkeozder.business.metrics.IBlogMetricBufferService;
import com.berkeozder.business.services.interfaces.IBlogServices;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;
import com.berkeozder.data.mapper.BlogMapper;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
import com.berkeozder.data.repository.ITagRepository;
import com.berkeozder.data.repository.IUserRepository;
import com.berkeozder.data.specification.BlogSpecification;
import com.berkeozder.exception.BerkeOzderException;
import com.berkeozder.exception._404_NotFoundException;
import com.berkeozder.file_upload.ImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Log4j2
@RequiredArgsConstructor
@Service
public class BlogServicesImpl implements IBlogServices<BlogDto, BlogEntity> {

    private static final String DEFAULT_SORT_FIELD = "blogId";

    private final IBlogCategoryRepository iBlogCategoryRepository;
    private final IBlogRepository iBlogRepository;
    private final ImageService imageService;
    private final IUserRepository iUserRepository;
    private final ITagRepository iTagRepository;

    private final BlogMapper blogMapper = new BlogMapper();

    @Autowired(required = false)
    private ApplicationEventPublisher eventPublisher;

    @Autowired(required = false)
    private IAiEmbeddingClient aiEmbeddingClient;

    @Autowired(required = false)
    private IBlogMetricBufferService metricBufferService;

    @Autowired(required = false)
    private BlogMetricFlushScheduler metricFlushScheduler;

    public void setMetricBufferService(IBlogMetricBufferService metricBufferService) {
        this.metricBufferService = metricBufferService;
    }

    public void setMetricFlushScheduler(BlogMetricFlushScheduler metricFlushScheduler) {
        this.metricFlushScheduler = metricFlushScheduler;
    }

    @Override
    public BlogDto entityToDto(BlogEntity blogEntity) {
        if (blogEntity == null) return null;
        BlogDto dto = blogMapper.toDto(blogEntity);
        if (dto != null) {
            dto.setLifecycleStatus(blogEntity.getLifecycleStatus());
            if (metricBufferService != null && dto.getBlogId() != null) {
                long bufferedViews = metricBufferService.getBufferedViews(dto.getBlogId());
                long bufferedLikes = metricBufferService.getBufferedLikes(dto.getBlogId());
                dto.setViewsCount((dto.getViewsCount() != null ? dto.getViewsCount() : 0L) + bufferedViews);
                dto.setLikesCount((dto.getLikesCount() != null ? dto.getLikesCount() : 0L) + bufferedLikes);
            }
        }
        return dto;
    }

    @Override
    public BlogEntity dtoToEntity(BlogDto blogDto) {
        return blogMapper.toEntity(blogDto);
    }

    private <T> T validateNotNull(T value, String message) {
        if (value == null) {
            throw new BerkeOzderException(message);
        }
        return value;
    }

    private Long validateId(Long id, String objectName) {
        validateNotNull(id, objectName + " ID boş olamaz.");
        if (id <= 0) {
            throw new BerkeOzderException(objectName + " ID 0'dan büyük olmalıdır.");
        }
        return id;
    }

    private String validateNotBlank(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BerkeOzderException(message);
        }
        return value.trim();
    }

    private <N extends Number> int validatePositiveNumber(N value, String fieldName) {
        validateNotNull(value, fieldName + " boş olamaz");
        int number = value.intValue();
        if (number <= 0) {
            throw new BerkeOzderException(fieldName + " 0'dan büyük olmalıdır");
        }
        return number;
    }

    private void validateBlogDto(BlogDto blogDto, boolean imageRequired) {
        if (blogDto == null) {
            throw new BerkeOzderException("Blog verisi boş olamaz");
        }
        if (blogDto.getHeader() == null || blogDto.getHeader().isBlank()) {
            throw new BerkeOzderException("Blog başlığı zorunludur");
        }
        if (blogDto.getContent() == null || blogDto.getContent().isBlank()) {
            throw new BerkeOzderException("Blog içeriği zorunludur");
        }
        if (imageRequired && (blogDto.getImage() == null || blogDto.getImage().isBlank())) {
            throw new BerkeOzderException("Blog resmi zorunludur");
        }
    }

    private Long validateBlogCategoryId(BlogDto blogDto, boolean required) {
        validateNotNull(blogDto, "Blog verisi boş");
        Long categoryId = blogDto.getBlogCategoryDto() == null
                ? null
                : blogDto.getBlogCategoryDto().getBlogCategoryId();

        if (categoryId == null && !required) {
            return null;
        }
        return validateId(categoryId, "Blog Kategori");
    }

    private BlogEntity findBlogEntityById(Long id) {
        Long validatedId = validateId(id, "Blog");
        return iBlogRepository.findById(validatedId)
                .orElseThrow(() -> new _404_NotFoundException("Blog id " + validatedId + " blog bulunamadı"));
    }

    private BlogCategoryEntity findBlogCategoryEntityById(Long categoryId) {
        Long validatedCategoryId = validateId(categoryId, "Blog Kategori");
        return iBlogCategoryRepository.findById(validatedCategoryId)
                .orElseThrow(() -> new _404_NotFoundException(validatedCategoryId + " id'li kategori bulunamadı"));
    }

    private void deleteImageSafely(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank() || !imageUrl.startsWith("/upload/")) {
            return;
        }
        try {
            imageService.deleteByUrl(imageUrl);
        } catch (Exception exception) {
            log.error("Blog resmi silinemedi: imageUrl={}, message={}", imageUrl, exception.getMessage());
        }
    }

    @Override
    @Transactional
    public List<BlogDto> speedData(Integer data) {
        int dataCount = validatePositiveNumber(data, "Speed Data sayısı");
        BlogCategoryEntity defaultCategory = iBlogCategoryRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new _404_NotFoundException("Speed Data oluşturmak için en az 1 adet blog category olması gerekiyor."));

        for (int i = 1; i <= dataCount; i++) {
            BlogEntity blogEntity = BlogEntity.builder()
                    .header("Blog-" + System.nanoTime())
                    .title("Blog Title " + i)
                    .content("Speed Data içerik açıklaması.")
                    .image(null)
                    .blogCategoryEntity(defaultCategory)
                    .build();
            iBlogRepository.save(blogEntity);
        }
        return objectServiceListSortedByAsc();
    }

    @Override
    @Transactional
    public List<BlogDto> deleteData() {
        iBlogRepository.findAll().forEach(blog -> deleteImageSafely(blog.getImage()));
        iBlogRepository.deleteAll();
        return objectServiceList();
    }

    @Override
    @Transactional
    public BlogDto objectServiceCreate(BlogDto blogDto) {
        validateBlogDto(blogDto, false);

        Long categoryId = validateBlogCategoryId(blogDto, true);
        BlogCategoryEntity categoryEntity = findBlogCategoryEntityById(categoryId);

        BlogEntity blogEntity = dtoToEntity(blogDto);
        blogEntity.setBlogCategoryEntity(categoryEntity);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            iUserRepository.findByUsername(authentication.getName()).ifPresent(blogEntity::setAuthor);
        }

        if (blogDto.getTags() != null && !blogDto.getTags().isEmpty()) {
            for (String tagName : blogDto.getTags()) {
                if (tagName != null && !tagName.isBlank()) {
                    String clean = tagName.trim().toLowerCase(Locale.ENGLISH).replace(" ", "-");
                    TagEntity tag = iTagRepository.findByNameIgnoreCase(clean)
                            .orElseGet(() -> iTagRepository.save(TagEntity.builder().name(clean).build()));
                    blogEntity.addTag(tag);
                }
            }
        }

        if (aiEmbeddingClient != null) {
            try {
                String textToEmbed = (blogEntity.getHeader() != null ? blogEntity.getHeader() : "") + " " +
                        (blogEntity.getTitle() != null ? blogEntity.getTitle() : "") + " " +
                        (blogEntity.getContent() != null ? blogEntity.getContent() : "");
                float[] embedding = aiEmbeddingClient.generateEmbedding(textToEmbed);
                blogEntity.setEmbedding(VectorUtils.serialize(embedding));
            } catch (Exception e) {
                log.warn("Blog kaydedilirken embedding üretilemedi: {}", e.getMessage());
            }
        }

        BlogEntity created = iBlogRepository.save(blogEntity);
        BlogDto createdDto = entityToDto(created);

        if (eventPublisher != null) {
            eventPublisher.publishEvent(new BlogCreatedEvent(this, createdDto));
        }

        return createdDto;
    }

    @Override
    public BlogDto objectServiceCreateWithFile(BlogDto blogDto, MultipartFile multipartFile) {
        validateNotNull(blogDto, "Blog verisi boş olamaz");
        if (multipartFile != null && !multipartFile.isEmpty()) {
            String relative = imageService.saveBlogImage(multipartFile);
            blogDto.setImage(relative);
        }
        return objectServiceCreate(blogDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> objectServiceList() {
        return iBlogRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BlogDto objectServiceFindById(Long id) {
        return entityToDto(findBlogEntityById(id));
    }

    @Override
    @Transactional
    public BlogDto objectServiceUpdate(Long id, BlogDto blogDto) {
        validateBlogDto(blogDto, false);
        BlogEntity blogEntity = findBlogEntityById(id);

        if (blogDto.getVersion() != null && !blogDto.getVersion().equals(blogEntity.getVersion())) {
            throw new ObjectOptimisticLockingFailureException(BlogEntity.class, id);
        }

        blogEntity.setHeader(blogDto.getHeader());
        blogEntity.setTitle(blogDto.getTitle());
        blogEntity.setContent(blogDto.getContent());

        if (blogDto.getImage() != null && !blogDto.getImage().isBlank()) {
            blogEntity.setImage(blogDto.getImage());
        }

        Long categoryId = validateBlogCategoryId(blogDto, false);
        if (categoryId != null) {
            blogEntity.setBlogCategoryEntity(findBlogCategoryEntityById(categoryId));
        }

        if (aiEmbeddingClient != null) {
            try {
                String textToEmbed = (blogEntity.getHeader() != null ? blogEntity.getHeader() : "") + " " +
                        (blogEntity.getTitle() != null ? blogEntity.getTitle() : "") + " " +
                        (blogEntity.getContent() != null ? blogEntity.getContent() : "");
                float[] embedding = aiEmbeddingClient.generateEmbedding(textToEmbed);
                blogEntity.setEmbedding(VectorUtils.serialize(embedding));
            } catch (Exception e) {
                log.warn("Blog güncellenirken embedding üretilemedi: {}", e.getMessage());
            }
        }

        BlogEntity updated = iBlogRepository.saveAndFlush(blogEntity);
        return entityToDto(updated);
    }

    @Override
    public BlogDto objectServiceUpdateWithFile(Long id, BlogDto blogDto, MultipartFile multipartFile) {
        validateNotNull(blogDto, "Blog verisi boş olamaz");
        BlogEntity currentBlogEntity = findBlogEntityById(id);
        String oldImageUrl = currentBlogEntity.getImage();

        if (multipartFile != null && !multipartFile.isEmpty()) {
            String relative = imageService.saveBlogImage(multipartFile);
            blogDto.setImage(relative);
        }

        BlogDto updatedDto = objectServiceUpdate(id, blogDto);

        if (multipartFile != null && !multipartFile.isEmpty() && oldImageUrl != null &&
                oldImageUrl.startsWith("/upload/") && !oldImageUrl.equals(updatedDto.getImage())) {
            deleteImageSafely(oldImageUrl);
        }
        return updatedDto;
    }

    @Override
    @Transactional
    public BlogDto objectServiceDelete(Long id) {
        BlogEntity findDelete = findBlogEntityById(id);
        BlogDto blogDto = entityToDto(findDelete);

        iBlogRepository.deleteById(id);
        deleteImageSafely(findDelete.getImage());

        return blogDto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BlogDto> objectServicePagination(int currentPage, int pageSize) {
        if (currentPage < 0) {
            throw new BerkeOzderException("Sayfa numarası 0 veya daha büyük olmalıdır");
        }
        validatePositiveNumber(pageSize, "Sayfa boyutu");

        Pageable pageable = PageRequest.of(currentPage, pageSize, Sort.by(Sort.Direction.ASC, DEFAULT_SORT_FIELD));
        return iBlogRepository.findAll(pageable).map(this::entityToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> objectServiceListSortedByDefault(String sortedBy) {
        String validatedSortedBy = validateNotBlank(sortedBy, "Sıralama alanı zorunludur");
        return iBlogRepository.findAll(Sort.by(Sort.Direction.ASC, validatedSortedBy))
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> objectServiceListSortedByAsc() {
        return iBlogRepository.findAll(Sort.by(Sort.Direction.ASC, DEFAULT_SORT_FIELD))
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> objectServiceListSortedByDesc() {
        return iBlogRepository.findAll(Sort.by(Sort.Direction.DESC, DEFAULT_SORT_FIELD))
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<BlogDto> searchBlogs(
            String search,
            Long categoryId,
            String tagName,
            String authorUsername,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = (size <= 0) ? 10 : Math.min(size, 100);

        String safeSortBy = (sortBy != null && !sortBy.isBlank()) ? sortBy.trim() : "createdDate";
        if (!List.of("blogId", "title", "header", "createdDate").contains(safeSortBy)) {
            safeSortBy = DEFAULT_SORT_FIELD;
        }

        Sort.Direction direction = (sortDir != null && sortDir.equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSortBy));
        Specification<BlogEntity> spec = BlogSpecification.filterBy(search, categoryId, tagName, authorUsername);
        Page<BlogEntity> blogPage = iBlogRepository.findAll(spec, pageable);

        return PagedResponseDto.of(blogPage.map(this::entityToDto));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponseDto<BlogDto> filterBlogs(BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }

        int safePage = Math.max(filterRequest.getPage(), 0);
        int safeSize = (filterRequest.getSize() <= 0) ? 10 : Math.min(filterRequest.getSize(), 100);

        String safeSortBy = (filterRequest.getSortBy() != null && !filterRequest.getSortBy().isBlank())
                ? filterRequest.getSortBy().trim() : "createdDate";
        if (!List.of("blogId", "title", "header", "createdDate").contains(safeSortBy)) {
            safeSortBy = DEFAULT_SORT_FIELD;
        }

        Sort.Direction direction = (filterRequest.getSortDir() != null && filterRequest.getSortDir().equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(direction, safeSortBy));
        Specification<BlogEntity> spec = BlogSpecification.fromFilter(filterRequest);
        Page<BlogEntity> blogPage = iBlogRepository.findAll(spec, pageable);

        return PagedResponseDto.of(blogPage.map(this::entityToDto));
    }

    @Override
    @Transactional
    public BlogDto restoreBlog(Long id) {
        int updatedRows = iBlogRepository.restoreBlogNative(id);
        if (updatedRows == 0) {
            throw new _404_NotFoundException("Geri yüklenecek silinmiş blog bulunamadı. ID: " + id);
        }
        BlogEntity restored = iBlogRepository.findById(id)
                .orElseThrow(() -> new _404_NotFoundException("Blog bulunamadı. ID: " + id));
        log.info("Soft-deleted blog geri yüklendi: ID={}, Header={}", id, restored.getHeader());
        return entityToDto(restored);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> findDeletedBlogs() {
        return iBlogRepository.findDeletedBlogsNative()
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogDto> findSoftDeletedBlogsInRetention(int retentionDays) {
        Date cutoffDate = new Date(System.currentTimeMillis() - (retentionDays * 24L * 60 * 60 * 1000L));
        return iBlogRepository.findSoftDeletedBlogsInRetentionNative(cutoffDate)
                .stream()
                .map(this::entityToDto)
                .toList();
    }

    @Override
    @Transactional
    public BulkOperationResponseDto executeBulkOperation(BulkOperationRequestDto request) {
        if (request == null || request.getBlogIds() == null || request.getBlogIds().isEmpty()) {
            throw new BerkeOzderException("Toplu işlem yapılacak blog ID listesi boş olamaz.");
        }
        if (request.getAction() == null) {
            throw new BerkeOzderException("Toplu işlem türü (action) belirtilmelidir.");
        }

        List<Long> ids = request.getBlogIds();
        int requestedCount = ids.size();
        int affectedCount;
        String message;

        switch (request.getAction()) {
            case SOFT_DELETE -> {
                affectedCount = iBlogRepository.bulkSoftDeleteNative(ids);
                message = String.format("%d adet blog başarıyla arşive taşındı (Soft Delete).", affectedCount);
                log.info("Toplu Soft Delete uygulandı: Talep={}, Etkilenen={}", requestedCount, affectedCount);
            }
            case RESTORE -> {
                affectedCount = iBlogRepository.bulkRestoreNative(ids);
                message = String.format("%d adet blog başarıyla geri yüklendi (Restore).", affectedCount);
                log.info("Toplu Restore uygulandı: Talep={}, Etkilenen={}", requestedCount, affectedCount);
            }
            case CHANGE_CATEGORY -> {
                if (request.getTargetCategoryId() == null || request.getTargetCategoryId() <= 0) {
                    throw new BerkeOzderException("Hedef kategori ID'si (targetCategoryId) belirtilmelidir.");
                }
                BlogCategoryEntity targetCategory = iBlogCategoryRepository.findById(request.getTargetCategoryId())
                        .orElseThrow(() -> new _404_NotFoundException("Hedef kategori bulunamadı. ID: " + request.getTargetCategoryId()));

                affectedCount = iBlogRepository.bulkChangeCategoryNative(ids, request.getTargetCategoryId());
                message = String.format("%d adet blog '%s' kategorisine başarıyla aktarıldı.", affectedCount, targetCategory.getCategoryName());
                log.info("Toplu Kategori Değiştirme uygulandı: Kategori={}, Talep={}, Etkilenen={}",
                        targetCategory.getCategoryName(), requestedCount, affectedCount);
            }
            case ADD_TAG -> {
                if (request.getTags() == null || request.getTags().isEmpty()) {
                    throw new BerkeOzderException("Etiket ekleme işlemi için en az bir etiket belirtilmelidir.");
                }

                Set<TagEntity> tagsToAdd = new HashSet<>();
                for (String rawTag : request.getTags()) {
                    if (rawTag == null || rawTag.isBlank()) continue;
                    String cleanName = rawTag.trim().toLowerCase(Locale.ENGLISH).replace("#", "").replace(" ", "-");
                    TagEntity tag = iTagRepository.findByNameIgnoreCase(cleanName)
                            .orElseGet(() -> iTagRepository.save(TagEntity.builder().name(cleanName).build()));
                    tagsToAdd.add(tag);
                }

                List<BlogEntity> blogs = iBlogRepository.findAllById(ids);
                for (BlogEntity blog : blogs) {
                    for (TagEntity tag : tagsToAdd) {
                        blog.addTag(tag);
                    }
                }
                iBlogRepository.saveAll(blogs);
                affectedCount = blogs.size();
                message = String.format("%d adet bloga %d adet etiket başarıyla eklendi.", affectedCount, tagsToAdd.size());
                log.info("Toplu Etiket Ekleme uygulandı: Talep={}, Etkilenen={}", requestedCount, affectedCount);
            }
            case HARD_DELETE -> {
                affectedCount = iBlogRepository.bulkHardDeleteNative(ids);
                message = String.format("%d adet blog kalıcı olarak silindi (Hard Delete).", affectedCount);
                log.warn("Toplu Kalıcı Silme uygulandı: Talep={}, Etkilenen={}", requestedCount, affectedCount);
            }
            default -> throw new BerkeOzderException("Bilinmeyen toplu işlem türü: " + request.getAction());
        }

        return BulkOperationResponseDto.builder()
                .action(request.getAction())
                .requestedCount(requestedCount)
                .affectedCount(affectedCount)
                .failedIds(Collections.emptyList())
                .message(message)
                .build();
    }

    @Override
    public long recordView(Long id) {
        validateId(id, "Blog");
        findBlogEntityById(id);
        if (metricBufferService != null) {
            metricBufferService.incrementView(id);
        } else {
            iBlogRepository.incrementViewsCountNative(id, 1L);
        }
        return getLiveViews(id);
    }

    @Override
    public long recordLike(Long id) {
        validateId(id, "Blog");
        findBlogEntityById(id);
        if (metricBufferService != null) {
            metricBufferService.incrementLike(id);
        } else {
            iBlogRepository.incrementLikesCountNative(id, 1L);
        }
        return getLiveLikes(id);
    }

    @Override
    public long removeLike(Long id) {
        validateId(id, "Blog");
        findBlogEntityById(id);
        if (metricBufferService != null) {
            metricBufferService.decrementLike(id);
        } else {
            iBlogRepository.incrementLikesCountNative(id, -1L);
        }
        return getLiveLikes(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long getLiveViews(Long id) {
        BlogEntity blogEntity = findBlogEntityById(id);
        long base = blogEntity.getViewsCount() != null ? blogEntity.getViewsCount() : 0L;
        long delta = metricBufferService != null ? metricBufferService.getBufferedViews(id) : 0L;
        return Math.max(0L, base + delta);
    }

    @Override
    @Transactional(readOnly = true)
    public long getLiveLikes(Long id) {
        BlogEntity blogEntity = findBlogEntityById(id);
        long base = blogEntity.getLikesCount() != null ? blogEntity.getLikesCount() : 0L;
        long delta = metricBufferService != null ? metricBufferService.getBufferedLikes(id) : 0L;
        return Math.max(0L, base + delta);
    }

    @Override
    public void flushMetrics() {
        if (metricFlushScheduler != null) {
            metricFlushScheduler.flushMetrics();
        }
    }
}
