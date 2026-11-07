package com.berkeozder.controller.api.impl;

import com.berkeozder.business.dto.BlogDto;
import com.berkeozder.business.dto.tag.TagDto;
import com.berkeozder.business.services.interfaces.ITagService;
import com.berkeozder.error.ApiResult;
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Log4j2
@RequiredArgsConstructor
@RestController
@RequestMapping("/blog/api/v1.0.0/tags")
@CrossOrigin(origins = FrontEnd.REACT_URL)
@Tag(name = "Tag API", description = "Blog Etiketleme ve Etiket Yönetimi Uç Noktaları")
public class TagApiImpl {

    private final ITagService tagService;

    @Operation(summary = "Tüm etiketleri listele")
    @GetMapping
    public ResponseEntity<ApiResult<List<TagDto>>> getAllTags() {
        return ResponseEntity.ok(ApiResult.success(tagService.getAllTags()));
    }

    @Operation(summary = "İsme göre tekil etiket getir")
    @GetMapping("/{name}")
    public ResponseEntity<ApiResult<TagDto>> getTagByName(@PathVariable String name) {
        return ResponseEntity.ok(ApiResult.success(tagService.getTagByName(name)));
    }

    @Operation(summary = "Yeni bir etiket oluştur (ADMIN / SUPER_ADMIN)")
    @PostMapping
    public ResponseEntity<ApiResult<TagDto>> createTag(@Valid @RequestBody TagDto tagDto) {
        TagDto created = tagService.createTag(tagDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResult.success(created));
    }

    @Operation(summary = "Blog yazısına etiket bağla (ADMIN / SUPER_ADMIN)")
    @PostMapping("/{blogId}/{tagName}")
    public ResponseEntity<ApiResult<String>> addTagToBlog(
            @PathVariable Long blogId,
            @PathVariable String tagName) {
        tagService.addTagToBlog(blogId, tagName);
        return ResponseEntity.ok(ApiResult.success("Etiket (#" + tagName + ") blog yazısına eklendi."));
    }

    @Operation(summary = "Blog yazısından etiketi kaldır (ADMIN / SUPER_ADMIN)")
    @DeleteMapping("/{blogId}/{tagName}")
    public ResponseEntity<ApiResult<String>> removeTagFromBlog(
            @PathVariable Long blogId,
            @PathVariable String tagName) {
        tagService.removeTagFromBlog(blogId, tagName);
        return ResponseEntity.ok(ApiResult.success("Etiket (#" + tagName + ") blog yazısından kaldırıldı."));
    }

    @Operation(summary = "Belirli bir etikete sahip tüm blog yazılarını listele")
    @GetMapping("/{tagName}/blogs")
    public ResponseEntity<ApiResult<List<BlogDto>>> getBlogsByTagName(@PathVariable String tagName) {
        return ResponseEntity.ok(ApiResult.success(tagService.getBlogsByTagName(tagName)));
    }
}

