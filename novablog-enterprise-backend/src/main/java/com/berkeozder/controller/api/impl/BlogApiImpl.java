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
import com.berkeozder.utily.FrontEnd;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

// LOMBOK
@RequiredArgsConstructor
@Log4j2

// API
@RestController
@RequestMapping("/blog/api/v1.0.0")
@CrossOrigin(origins = FrontEnd.REACT_URL)
public class BlogApiImpl implements IBlogApi<BlogDto> {

    // DI
    // Field
    private final IBlogServices<BlogDto, BlogEntity> iBlogServices;
    private final ObjectMapper objectMapper;

    /// ///////////////////////////////////////////////////////////////
    /// SPEED DATA
    /// http://localhost:5555/blog/api/v1.0.0/speed
    @Override
    @GetMapping("/speed")
    public ResponseEntity<ApiResult<List<BlogDto>>> speedData(Integer data) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.speedData(data)));
    }

    /// DELETE DATA
    /// http://localhost:5555/blog/api/v1.0.0/delete-all
    @Override
    @GetMapping("/delete-all")
    public ResponseEntity<ApiResult<List<BlogDto>>> deleteData() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.deleteData()));
    }

    /// ///////////////////////////////////////////////////////////////
    /// CREATE RESIMSIZ (BLOG)
    /// http://localhost:5555/blog/api/v1.0.0/create
    @Override
    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreate(@Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreate(blogDto)));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    /// CREATE RESIMLI (BLOG)
    @Override
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiCreateWithFile(
            @RequestPart("blog") String json,
            @RequestPart(value = "file", required = false) MultipartFile multipartFile) {
        try {
            BlogDto blogDto = objectMapper.readValue(json, BlogDto.class);
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceCreateWithFile(blogDto, multipartFile)));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/create"));
        }
    }

    ///  LIST (BLOG)
    @Override
    @GetMapping("/list")
    public ResponseEntity<ApiResult<List<BlogDto>>> objectApiList() {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceList()));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/liste"));
        }
    }

    /// FIND BY ID (BLOG)
    @Override
    @GetMapping("/find/{id}")
    public ResponseEntity<ApiResult<?>> objectApiFindById(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceFindById(id)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/find/1"));
        }
    }

    /// UPDATE RESIMSIZ (BLOG) ==> AYNI ZAMANDA MEVCUT RESİMİ KORUR
    @Override
    @PutMapping(value = "/update/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<?>> objectApiUpdate(@PathVariable(name = "id") Long id, @Valid @RequestBody BlogDto blogDto) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceUpdate(id, blogDto)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/find/1"));
        }
    }

    /// UPDATE RESIMLI (BLOG)
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
            ex.printStackTrace();
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/update"));
        }
    }

    /// DELETE (BLOG)
    @Override
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResult<?>> objectApiDelete(@PathVariable(name = "id") Long id) {
        try {
            return ResponseEntity.ok(ApiResult.success(iBlogServices.objectServiceDelete(id)));
        } catch (Exception ex) {
            return ResponseEntity.ok(ApiResult.error("serverError", ex.getMessage(), "/blog/api/v1.0.0/delete/" + id));
        }
    }

    /// ////////////////////////////////////////////////////////////////////
    // PAGINATION/SORTING
    /*
     PathVariable ve RequestParam Arasındaki Farklar

    | Özellik             | @PathVariable                                         | @RequestParam                                   |
    |-------------------------------------------------------|----------------------------------------------------|
    | Amaç                | URL yolundaki bir parametreyi alır.                   | Sorgu parametrelerini (query parameters) alır.     |
    | Kullanım Yeri       | URL'nin bir parçası olarak tanımlanır.                | URL'deki `?` işaretinden sonra gelen parametrelerle çalışır. |
    | URL Örneği          | `/api/users/{id}`                                     | `/api/users?name=Berke`                             |
    | Tanımlama Şekli     | `@PathVariable("id") Long id`                         | `@RequestParam("name") String name`               |
    | Zorunluluk          | Varsayılan olarak zorunludur (opsiyonel yapılabilir). | Varsayılan olarak zorunludur (opsiyonel yapılabilir).|
    | Çoklu Değerler      | Sadece tek bir değer alır.                            | Birden fazla parametreyi kolayca alabilir.         |

     Örnekler
     @PathVariable Kullanımı
    URL: `/api/users/123`

    @GetMapping("/api/users/{id}")
    public ResponseEntity<String> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok("User ID: " + id);
    }

    @RequestParam Kullanımı
    URL: `/api/users?name=Berke`

    @GetMapping("/api/users")
    public ResponseEntity<String> getUserByName(@RequestParam("name") String name) {
        return ResponseEntity.ok("User Name: " + name);
    }
    ---

     Temel Fark
    - @PathVariable, dinamik bir URL'nin bir parçasını temsil eder.
    - @RequestParam, sorgu parametrelerini alır ve genelde isteğe bağlı parametreler için kullanılır.

    Hangi Durumda Kullanılır?
    - @PathVariable: Kaynak kimliğini veya bir URL'nin parçasını almak için.
    - @RequestParam: Filtreleme, sıralama veya arama gibi isteğe bağlı parametrelerle çalışmak için.
    */

    /// PAGINATION & SORTING
    /// PAGINATION
    // 1.sayfada 4 tane veri getir.
    // http://localhost:5555/blog/api/v1.0.0/pagination?current_page=0&page_size=4
    @Override
    @GetMapping(value = "/pagination")
    public ResponseEntity<Page<?>> objectApiPagination(
            @RequestParam(name = "current_page", required = false, defaultValue = "0") int currentPage,
            @RequestParam(name = "page_size", required = false, defaultValue = "10") int pageSize) {
        return ResponseEntity.ok(iBlogServices.objectServicePagination(currentPage, pageSize));
    }

    /// ADVANCED SEARCH & FILTERING & PAGINATION (Adım 5)
    // http://localhost:5555/blog/api/v1.0.0/search?search=java&category_id=1&tag=spring-boot&author=admin&page=0&size=10&sort_by=createdDate&sort_dir=desc
    @Operation(summary = "Gelişmiş Çok Kriterli Blog Arama ve Sayfalama",
            description = "Başlık, header, içerik kelime araması, kategori, etiket ve yazar filtresi ile sıralanmış ve sayfalanmış blog listesi döner.")
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

    /// ///////////////////////////////////////////////////////////////
    /// DYNAMIC CRITERIA API FILTERING (Adım 14)
    /// http://localhost:5555/blog/api/v1.0.0/filter
    @Operation(summary = "Gelişmiş Çok Kriterli Dinamik Blog Filtreleme (POST)",
            description = "Arama kelimesi, kategori ID/adı, etiketler, yazar, tarih aralığı, minimum yorum sayısı ve görsel durumu kriterlerini Criteria API ile filtreler.")
    @PostMapping(value = "/filter", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsPost(
            @Valid @RequestBody(required = false) BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    @Operation(summary = "Gelişmiş Çok Kriterli Dinamik Blog Filtreleme (GET)",
            description = "URL sorgu parametreleri üzerinden çok kriterli blog filtreleme ve sayfalama.")
    @GetMapping(value = "/filter")
    public ResponseEntity<ApiResult<PagedResponseDto<BlogDto>>> filterBlogsGet(
            @Valid @ModelAttribute BlogFilterRequestDto filterRequest) {
        if (filterRequest == null) {
            filterRequest = BlogFilterRequestDto.builder().build();
        }
        PagedResponseDto<BlogDto> result = iBlogServices.filterBlogs(filterRequest);
        return ResponseEntity.ok(ApiResult.success(result));
    }

    ///  SORTING
    // SORTING (Belli Sütuna göre)
    @Override
    @GetMapping(value = "/sorting")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDefault(
            @RequestParam(name = "sorted_by", required = false, defaultValue = "header") String sortedBy) {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDefault(sortedBy));
    }

    ///  SORTING ASC (Küçükten büyüğe doğru)
    @Override
    @GetMapping(value = "/sorting/header/asc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByAsc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByAsc());
    }

    ///  SORTING DESC (Büyükten küçüğe doğru)
    @Override
    @GetMapping(value = "/sorting/header/desc")
    public ResponseEntity<List<BlogDto>> objectApiListSortedByDesc() {
        return ResponseEntity.ok(iBlogServices.objectServiceListSortedByDesc());
    }

    /// ///////////////////////////////////////////////////////////////
    /// SOFT DELETE RESTORE & ARŞİV LİSTESİ (Adım 12)
    /// RESTORE (SOFT DELETED BLOG)
    /// http://localhost:5555/blog/api/v1.0.0/restore/{id}
    @Operation(summary = "Silinmiş blogu geri yükle (Restore)", description = "Soft delete ile silinmiş bir blog yazısını tekrar aktif hale getirir.")
    @PostMapping(value = "/restore/{id}")
    public ResponseEntity<ApiResult<BlogDto>> restoreBlog(@PathVariable(name = "id") Long id) {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.restoreBlog(id)));
    }

    /// DELETED BLOGS (ARCHIVED)
    /// http://localhost:5555/blog/api/v1.0.0/deleted
    @Operation(summary = "Silinmiş (Arşivdeki) blogları listele", description = "Sadece admin/super-admin yetkisiyle erişilebilen silinmiş blog listesi.")
    @GetMapping(value = "/deleted")
    public ResponseEntity<ApiResult<List<BlogDto>>> findDeletedBlogs() {
        return ResponseEntity.ok(ApiResult.success(iBlogServices.findDeletedBlogs()));
    }

    /// ///////////////////////////////////////////////////////////////
    /// BULK BATCH OPERATIONS (Adım 15)
    /// http://localhost:5555/blog/api/v1.0.0/bulk
    @Operation(summary = "Toplu Blog İşlemleri (Bulk Batch Operations)",
            description = "Birden çok blog üzerinde tek seferde toplu silme, geri yükleme, kategori değiştirme, etiket ekleme veya kalıcı silme işlemi gerçekleştirir. Sadece ADMIN/SUPER_ADMIN yetkisiyle çalışır.")
    @PostMapping(value = "/bulk", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResult<BulkOperationResponseDto>> executeBulkOperation(
            @Valid @RequestBody BulkOperationRequestDto request) {
        log.info("REST: Toplu işlem talebi alındı. Action: {}, ID adedi: {}", request.getAction(), request.getBlogIds().size());
        BulkOperationResponseDto response = iBlogServices.executeBulkOperation(request);
        return ResponseEntity.ok(ApiResult.success(response));
    }
} // end BlogApiImpl
