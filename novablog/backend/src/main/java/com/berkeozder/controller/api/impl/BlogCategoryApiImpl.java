package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.BlogCategoryDto;
import com.berkeozder.business.services.interfaces.IBlogCategoryServices;
import com.berkeozder.controller.api.interfaces.IBlogCategoryApi;
import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/blog/category/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Blog Categories", description = "Endpoints for managing blog categories")
public class BlogCategoryApiImpl implements IBlogCategoryApi<BlogCategoryDto> {

    private final IBlogCategoryServices<BlogCategoryDto, BlogCategoryEntity> iBlogCategoryServices;

    @Operation(summary = "Speed data seeder for categories")
    @GetMapping("/speed")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> speedData(Integer data) {
        return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.speedData(data)));
    }

    @Operation(summary = "Delete all categories")
    @GetMapping("/delete-all")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> deleteData() {
        return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.deleteData()));
    }

    @Operation(summary = "Create blog category")
    @PostMapping("/create")
    @Override
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceCreate(blogCategoryDto)));
        } catch (Exception ex) {
            log.error("Kategori oluşturulamadı: {}", ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/create"));
        }
    }

    @Operation(summary = "List all blog categories")
    @GetMapping("/list")
    @Override
    public ResponseEntity<ApiResult<List<BlogCategoryDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceList()));
        } catch (Exception ex) {
            log.error("Kategori listesi alınamadı: {}", ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/list"));
        }
    }

    @Operation(summary = "Find blog category by ID")
    @GetMapping({"/find/{id}", "/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            log.error("Kategori bulunamadı (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/find/" + id));
        }
    }

    @Operation(summary = "Update blog category")
    @PutMapping({"/update/{id}", "/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody BlogCategoryDto blogCategoryDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceUpdate(id, blogCategoryDto)));
        } catch (Exception ex) {
            log.error("Kategori güncellenemedi (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/update/" + id));
        }
    }

    @Operation(summary = "Delete blog category")
    @DeleteMapping({"/delete/{id}", "/{id}"})
    @Override
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogCategoryServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            log.error("Kategori silinemedi (ID: {}): {}", id, ex.getMessage());
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/category/api/v1.0.0/delete/" + id));
        }
    }
}
