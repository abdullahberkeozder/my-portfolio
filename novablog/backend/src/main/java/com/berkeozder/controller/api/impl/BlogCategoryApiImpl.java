package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.services.interfaces.IBlogCategoryServices;
import com.berkeozder.controller.api.interfaces.IBlogCategoryApi;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.error.ApiResult;
import com.berkeozder.util.FrontEnd;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller implementation for Blog Category management endpoints.
 */
@Tag(name = "Category API", description = "Endpoints for managing blog categories")
@RestController
@RequestMapping("/blog/category/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@RequiredArgsConstructor
@Log4j2
public class BlogCategoryApiImpl implements IBlogCategoryApi<BlogCategoryDto> {

    private final IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> iBlogCategoryServices;

    @GetMapping("/speed")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> speedData(Integer data) {
        return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.speedData(data)));
    }

    @GetMapping("/delete-all")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> deleteData() {
        return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.deleteData()));
    }

    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceCreate(blogCategoryDto)));
        } catch (Exception ex) {
            log.error("Failed to create blog category: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/create"));
        }
    }

    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceList()));
        } catch (Exception ex) {
            log.error("Failed to list blog categories: {}", ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/liste"));
        }
    }

    @GetMapping("find/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            log.error("Failed to find blog category {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/find/" + id));
        }
    }

    @PutMapping("update/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceUpdate(id, blogCategoryDto)));
        } catch (Exception ex) {
            log.error("Failed to update blog category {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/update/" + id));
        }
    }

    @DeleteMapping("delete/{id}")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            log.error("Failed to delete blog category {}: {}", id, ex.getMessage(), ex);
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/delete/" + id));
        }
    }
}
