package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.BlogFilterRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationResponseDto;
import com.berkeozder.business.dto.common.PagedResponseDto;
import com.berkeozder.business.services.interfaces.IBlogServices;
import com.berkeozder.controller.api.interfaces.IBlogApi;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/blog/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Blogs", description = "Endpoints for managing blog articles, search, metrics, and bulk operations")
public class BlogApiImpl implements IBlogApi<BlogDto> {

    private final IBlogServices<BlogDto, BlogEntity> iBlogServices;
    private final ObjectMapper objectMapper;

    @Operation(summary = "Speed data seeder for blogs")
    @Override
    @GetMapping("/speed")
    public ResponseEntity<ApiResult<List<BlogDto>>> speedData(Integer data) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.speedData(data)));
    }

    @Operation(summary = "Delete all blog data")
    @Override
    @GetMapping("/delete-all")
    public ResponseEntity<ApiResult<List<BlogDto>>> deleteData() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.deleteData()));
    }

    @Operation(summary = "Create blog without image")
    @Override
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreate(blogDto)));
        } catch (Exception ex) {
            log.error("Blog oluşturma hatası: {}", ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    @Operation(summary = "Create blog with multipart image file")
    @Override
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreateWithFile(
            @RequestPart("blog") String json,
            @RequestPart(value = "file", required = false) MultipartFile multipartFile) {
        try {
            BlogDto blogDto = objectMapper.readValue(json, BlogDto.class);
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreateWithFile(blogDto, multipartFile)));
        } catch (Exception ex) {
            log.error("Resimli blog oluşturma hatası: {}", ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    @Operation(summary = "List all blogs")
    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<BlogDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceList()));
        } catch (Exception ex) {
            log.error("Blog listesi alma hatası: {}", ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/list"));
        }
    }

    @Operation(summary = "Find blog by ID")
    @Override
    @GetMapping({"/find/{id}", "/{id}"})
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            log.error("Blog bulunamadı (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/find/" + id));
        }
    }

    @Operation(summary = "Update blog (JSON)")
    @Override
    @PutMapping(value = {"/update/{id}", "/{id}"}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody BlogDto blogDto) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceUpdate(id, blogDto)));
    }

    @Operation(summary = "Update blog with multipart image file")
    @Override
    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiUpdateWithFile(
            @PathVariable(name = "id") Long id,
            @RequestPart("blog") String json,
            @RequestPart(value = "file", required = false) MultipartFile multipartFile) {
        try {
            BlogDto blogDto = objectMapper.readValue(json, BlogDto.class);
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceUpdateWithFile(id, blogDto, multipartFile)));
        } catch (Exception ex) {
            log.error("Resimli blog güncelleme hatası (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update"));
        }
    }

    @Operation(summary = "Delete blog by ID (Soft delete)")
    @Override
    @DeleteMapping({"/delete/{id}", "/{id}"})
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            log.error("Blog silme hatası (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/delete/" + id));
        }
    }

    @Operation(summary = "Paginate blogs")
    @Override
    @GetMapping(value = "/pagination")
    public ResponseEntity<Page<?>> objectApiPagination(
            @RequestParam(name = "current_page", required = false, defaultValue = "0") int currentPage,
            @RequestParam(name = "page_size", required = false, defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(iBlogServices.objectServicePagination(currentPage, pageSize));
    }

    @Operation(summary = "Multi-criteria search & pagination",
            description = "Searches blogs by keyword, category, tag, and author with pagination and sorting.")
    @GetMapping(value = "/search")
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> searchBlogs(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "category_id", required = false) Long categoryId,
            @RequestParam(name = "tag", required = false) String tag,
            @RequestParam(name = "author", required = false) String author,
            @RequestParam(name = "page", required = false, defaultValue = "0") int page,
            @RequestParam(name = "size", required = false, defaultValue = "10") int size,
            @RequestParam(name = "sort_by", required = false, defaultValue = "createdDate") String sortBy,
            @RequestParam(name = "sort_dir", required = false, defaultValue = "desc") String sortDir) {
        PagedResponseDto<BlogDto> result = iBlogServices.searchBlogs(search, categoryId, tag, author, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Dynamic Criteria API blog filtering (POST)")
    @PostMapping(value = "/filter", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsPost(
            @Valid @RequestBody(required = false) BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Dynamic Criteria API blog filtering (GET)")
    @GetMapping(value = "/filter")
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsGet(
            @Valid @ModelAttribute BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Sort blogs by given field")
    @Override
    @GetMapping(value = "/sorting")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDefault(
            @RequestParam(name = "sorted_by", required = false, defaultValue = "header") String sortedBy) {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDefault(sortedBy));
    }

    @Operation(summary = "Sort blogs ascending by header")
    @Override
    @GetMapping(value = "/sorting/header/asc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByAsc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByAsc());
    }

    @Operation(summary = "Sort blogs descending by header")
    @Override
    @GetMapping(value = "/sorting/header/desc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDesc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDesc());
    }

    @Operation(summary = "Restore soft-deleted blog", description = "Restores a soft-deleted blog article back to active state.")
    @PostMapping(value = "/restore/{id}")
    public ResponseEntity<ApiResult<BlogDto>> restoreBlog(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.restoreBlog(id)));
    }

    @Operation(summary = "List soft-deleted archived blogs", description = "Lists archived blogs. Requires ADMIN/SUPER_ADMIN authority.")
    @GetMapping(value = "/deleted")
    public ResponseEntity<ApiResult<List<BlogDto>>> findDeletedBlogs() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.findDeletedBlogs()));
    }

    @Operation(summary = "Bulk batch operations on blogs",
            description = "Performs bulk actions (soft delete, restore, change category, add tag, hard delete) in a single transaction.")
    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<BulkOperationResponseDto>> executeBulkOperation(
            @Valid @RequestBody BulkOperationRequestDto request) {
        log.info("Bulk operation requested: action={}, count={}", request.getAction(), request.getBlogIds().size());
        BulkOperationResponseDto response = iBlogServices.executeBulkOperation(request);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @Operation(summary = "Increment blog view counter (Write-Behind)",
            description = "Atomically records view increment into Redis write-behind buffer and returns live combined total.")
    @PostMapping(value = "/{id}/view")
    public ResponseEntity<ApiResult<Map<String, Object>>> recordView(@PathVariable(name = "id") Long id) {
        long liveViews = iBlogServices.recordView(id);
        return ResponseEntity.ok(ApiResult.success(Map.of("blogId", id, "viewsCount", liveViews)));
    }

    @Operation(summary = "Increment blog like counter (Write-Behind)",
            description = "Atomically records like increment into Redis write-behind buffer and returns live combined total.")
    @PostMapping(value = "/{id}/like")
    public ResponseEntity<ApiResult<Map<String, Object>>> recordLike(@PathVariable(name = "id") Long id) {
        long liveLikes = iBlogServices.recordLike(id);
        return ResponseEntity.ok(ApiResult.success(Map.of("blogId", id, "likesCount", liveLikes)));
    }

    @Operation(summary = "Decrement blog like counter (Write-Behind)",
            description = "Atomically records unlike into Redis write-behind buffer and returns live combined total.")
    @DeleteMapping(value = "/{id}/like")
    public ResponseEntity<ApiResult<Map<String, Object>>> removeLike(@PathVariable(name = "id") Long id) {
        long liveLikes = iBlogServices.removeLike(id);
        return ResponseEntity.ok(ApiResult.success(Map.of("blogId", id, "likesCount", liveLikes)));
    }

    @Operation(summary = "Flush buffered metrics to database",
            description = "Drains the write-behind buffer and persists deltas into PostgreSQL immediately.")
    @PostMapping(value = "/metrics/flush")
    public ResponseEntity<ApiResult<String>> flushMetrics() {
        iBlogServices.flushMetrics();
        return ResponseEntity.ok(ApiResult.success("Tamponlanmış blog metrikleri başarıyla veritabanına aktarıldı."));
    }
}
