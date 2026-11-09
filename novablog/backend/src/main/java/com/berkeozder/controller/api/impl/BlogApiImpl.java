package com.berkeozder.controller.api.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.BlogFilterRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationRequestDto;
import com.berkeozder.business.dto.bulk.BulkOperationResponseDto;
import com.berkeozder.business.dto.common.PagedResponseDto;
import com.berkeozder.business.services.interfaces.IBlogServices;
import com.berkeozder.controller.api.interfaces.IBlogApi;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.error.ApiResult;
import com.berkeozder.util.FrontEnd;
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

/**
 * REST controller implementation for Blog management endpoints.
 */
@Tag(name = "Blog API", description = "Endpoints for creating, querying, updating and managing blog posts")
@RestController
@RequestMapping("/blog/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@RequiredArgsConstructor
@Log4j2
public class BlogApiImpl implements IBlogApi<BlogDto> {

    private final IBlogServices<BlogDto, BlogEntity> iBlogServices;
    private final ObjectMapper objectMapper;

    @Override
    @GetMapping("/speed")
    public ResponseEntity<ApiResult<List<BlogDto>>> speedData(Integer data) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.speedData(data)));
    }

    @Override
    @GetMapping("/delete-all")
    public ResponseEntity<ApiResult<List<BlogDto>>> deleteData() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.deleteData()));
    }

    @Override
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreate(blogDto)));
        } catch (Exception ex) {
            log.error("Failed to create blog: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    @Override
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreateWithFile(
            @RequestPart("blog") String json,
            @RequestPart(value = "file", required = false) MultipartFile multipartFile) {
        try {
            BlogDto blogDto = objectMapper.readValue(json, BlogDto.class);
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreateWithFile(blogDto, multipartFile)));
        } catch (Exception ex) {
            log.error("Failed to create blog with file: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<BlogDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceList()));
        } catch (Exception ex) {
            log.error("Failed to list blogs: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/liste"));
        }
    }

    @Override
    @GetMapping("/find/{id}")
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            log.error("Failed to find blog by id {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/find/" + id));
        }
    }

    @Override
    @PutMapping(value = "/update/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceUpdate(id, blogDto)));
        } catch (Exception ex) {
            log.error("Failed to update blog {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update/" + id));
        }
    }

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
            log.error("Failed to update blog with file {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update/" + id));
        }
    }

    @Override
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            log.error("Failed to delete blog {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/delete/" + id));
        }
    }

    @Override
    @GetMapping(value = "/pagination")
    public ResponseEntity<Page<?>> objectApiPagination(
            @RequestParam(name = "current_page", required = false, defaultValue = "0") int currentPage,
            @RequestParam(name = "page_size", required = false, defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(iBlogServices.objectServicePagination(currentPage, pageSize));
    }

    @Operation(summary = "Advanced multi-criteria blog search and pagination",
            description = "Returns paginated and sorted blog list matching title, content, category, tag, and author.")
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

    @Operation(summary = "Dynamic criteria blog filter (POST)",
            description = "Filters blogs using JPA Criteria API across date range, comments, tags, author, and categories.")
    @PostMapping(value = "/filter", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsPost(
            @Valid @RequestBody(required = false) BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Dynamic criteria blog filter (GET)",
            description = "Query parameter driven blog filter and pagination.")
    @GetMapping(value = "/filter")
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsGet(
            @Valid @ModelAttribute BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Override
    @GetMapping(value = "/sorting")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDefault(
            @RequestParam(name = "sorted_by", required = false, defaultValue = "header") String sortedBy) {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDefault(sortedBy));
    }

    @Override
    @GetMapping(value = "/sorting/header/asc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByAsc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByAsc());
    }

    @Override
    @GetMapping(value = "/sorting/header/desc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDesc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDesc());
    }

    @Operation(summary = "Restore soft-deleted blog", description = "Restores a soft-deleted blog post to active status.")
    @PostMapping(value = "/restore/{id}")
    public ResponseEntity<ApiResult<BlogDto>> restoreBlog(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.restoreBlog(id)));
    }

    @Operation(summary = "List soft-deleted blogs", description = "Lists archived / soft-deleted blogs (admin only).")
    @GetMapping(value = "/deleted")
    public ResponseEntity<ApiResult<List<BlogDto>>> findDeletedBlogs() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.findDeletedBlogs()));
    }

    @Operation(summary = "Bulk batch blog operations",
            description = "Executes batch deletion, restoration, tag assignment or category updates across multiple blogs.")
    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<BulkOperationResponseDto>> executeBulkOperation(
            @Valid @RequestBody BulkOperationRequestDto request) {
        log.info("REST: Executing bulk operation. Action: {}, ID count: {}", request.getAction(), request.getBlogIds().size());
        BulkOperationResponseDto response = iBlogServices.executeBulkOperation(request);
        return ResponseEntity.ok(ApiResult.success(response));
    }
}
