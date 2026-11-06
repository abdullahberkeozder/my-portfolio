package com.berkeozder.data.specification;

import com.berkeozder.business.dto.BlogFilterRequestDto;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.entity.TagEntity;
import com.berkeozder.data.entity.UserEntity;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.*;

/**
 * Kurumsal JPA Criteria API Specification Motoru (Adım 14)
 * Tip güvenli, dinamik ve modüler arama/filtreleme sorguları üretir.
 *
 * @author Berke Özder
 */
public class BlogSpecification {

    private BlogSpecification() {
        // Utility class
    }

    /**
     * DTO üzerinden gelen tüm filtreleme kriterlerini kombine eden ana Specification üretici.
     */
    public static Specification<BlogEntity> fromFilter(BlogFilterRequestDto filter) {
        if (filter == null) {
            return (root, query, cb) -> cb.conjunction();
        }

        Specification<BlogEntity> spec = (root, query, cb) -> cb.conjunction();

        // 1. Serbest Metin Arama (Header, Title, Content)
        if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
            spec = spec.and(withSearch(filter.getSearch()));
        }

        // 2. Kategori ID Filtresi
        if (filter.getCategoryId() != null && filter.getCategoryId() > 0) {
            spec = spec.and(withCategoryId(filter.getCategoryId()));
        }

        // 3. Kategori Adı Filtresi
        if (filter.getCategoryName() != null && !filter.getCategoryName().trim().isEmpty()) {
            spec = spec.and(withCategoryName(filter.getCategoryName()));
        }

        // 4. Etiketler Filtresi (Çoklu Etiket OR eşleşmesi)
        if (filter.getTags() != null && !filter.getTags().isEmpty()) {
            spec = spec.and(withTags(filter.getTags()));
        }

        // 5. Yazar Filtresi (Kullanıcı Adı, E-posta veya CreatedBy)
        if (filter.getAuthor() != null && !filter.getAuthor().trim().isEmpty()) {
            spec = spec.and(withAuthor(filter.getAuthor()));
        }

        // 6. Tarih Aralığı Filtresi
        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            spec = spec.and(withDateRange(filter.getStartDate(), filter.getEndDate()));
        }

        // 7. Minimum Yorum Sayısı Filtresi
        if (filter.getMinCommentCount() != null && filter.getMinCommentCount() > 0) {
            spec = spec.and(withMinCommentCount(filter.getMinCommentCount()));
        }

        // 8. Görsel Durumu Filtresi
        if (filter.getHasImage() != null) {
            spec = spec.and(withHasImage(filter.getHasImage()));
        }

        return spec;
    }

    /**
     * Geriye dönük uyumluluk için korunan klasik 4 parametreli filtreleme metodu.
     */
    public static Specification<BlogEntity> filterBy(
            String search,
            Long categoryId,
            String tagName,
            String authorUsername
    ) {
        List<String> tags = (tagName != null && !tagName.isBlank()) ? Collections.singletonList(tagName) : null;
        return fromFilter(BlogFilterRequestDto.builder()
                .search(search)
                .categoryId(categoryId)
                .tags(tags)
                .author(authorUsername)
                .build());
    }

    /// ///////////////////////////////////////////////////////////////
    /// MODÜLER CRITERIA API SPECIFICATION PARÇALARI
    /// ///////////////////////////////////////////////////////////////

    /**
     * Başlık, alt başlık (header) veya içerikte arama (Case-insensitive LIKE)
     */
    public static Specification<BlogEntity> withSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase(Locale.ENGLISH) + "%";
            Predicate titleLike = cb.like(cb.lower(root.get("title")), pattern);
            Predicate headerLike = cb.like(cb.lower(root.get("header")), pattern);
            Predicate contentLike = cb.like(cb.lower(root.get("content")), pattern);
            return cb.or(titleLike, headerLike, contentLike);
        };
    }

    /**
     * Kategori ID filtresi
     */
    public static Specification<BlogEntity> withCategoryId(Long categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null || categoryId <= 0) {
                return cb.conjunction();
            }
            return cb.equal(root.get("blogCategoryEntity").get("blogCategoryId"), categoryId);
        };
    }

    /**
     * Kategori adı filtresi (Kısmi veya tam eşleşme)
     */
    public static Specification<BlogEntity> withCategoryName(String categoryName) {
        return (root, query, cb) -> {
            if (categoryName == null || categoryName.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + categoryName.trim().toLowerCase(Locale.ENGLISH) + "%";
            return cb.like(cb.lower(root.get("blogCategoryEntity").get("categoryName")), pattern);
        };
    }

    /**
     * Çoklu etiket filtresi (INNER JOIN blog_tags & IN clause)
     */
    public static Specification<BlogEntity> withTags(Collection<String> tags) {
        return (root, query, cb) -> {
            if (tags == null || tags.isEmpty()) {
                return cb.conjunction();
            }

            List<String> cleanTags = tags.stream()
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .filter(t -> !t.isEmpty())
                    .map(t -> t.toLowerCase(Locale.ENGLISH).replace("#", "").replace(" ", "-"))
                    .toList();

            if (cleanTags.isEmpty()) {
                return cb.conjunction();
            }

            Join<BlogEntity, TagEntity> tagJoin = root.join("tags", JoinType.INNER);
            CriteriaBuilder.In<String> inClause = cb.in(cb.lower(tagJoin.get("name")));
            for (String tag : cleanTags) {
                inClause.value(tag);
            }

            if (query != null) {
                query.distinct(true);
            }

            return inClause;
        };
    }

    /**
     * Yazar filtresi (Kullanıcı adı, e-posta veya createdBy)
     */
    public static Specification<BlogEntity> withAuthor(String author) {
        return (root, query, cb) -> {
            if (author == null || author.trim().isEmpty()) {
                return cb.conjunction();
            }

            Join<BlogEntity, UserEntity> authorJoin = root.join("author", JoinType.LEFT);
            String pattern = "%" + author.trim().toLowerCase(Locale.ENGLISH) + "%";

            Predicate usernameMatch = cb.like(cb.lower(authorJoin.get("username")), pattern);
            Predicate emailMatch = cb.like(cb.lower(authorJoin.get("email")), pattern);
            Predicate createdByMatch = cb.like(cb.lower(root.get("createdBy")), pattern);

            return cb.or(usernameMatch, emailMatch, createdByMatch);
        };
    }

    /**
     * Tarih aralığı filtresi (Oluşturulma tarihi)
     */
    public static Specification<BlogEntity> withDateRange(Date startDate, Date endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdDate"), startDate));
            }

            if (endDate != null) {
                // Günün sonuna kadar dahil edebilmek için 23:59:59.999 ayarı
                Calendar cal = Calendar.getInstance();
                cal.setTime(endDate);
                cal.set(Calendar.HOUR_OF_DAY, 23);
                cal.set(Calendar.MINUTE, 59);
                cal.set(Calendar.SECOND, 59);
                cal.set(Calendar.MILLISECOND, 999);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdDate"), cal.getTime()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Minimum yorum adedi filtresi (Criteria size fonksiyonu)
     */
    public static Specification<BlogEntity> withMinCommentCount(Integer minCommentCount) {
        return (root, query, cb) -> {
            if (minCommentCount == null || minCommentCount <= 0) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(cb.size(root.get("comments")), minCommentCount);
        };
    }

    /**
     * Görsel mevcudiyeti filtresi
     */
    public static Specification<BlogEntity> withHasImage(Boolean hasImage) {
        return (root, query, cb) -> {
            if (hasImage == null) {
                return cb.conjunction();
            }
            if (Boolean.TRUE.equals(hasImage)) {
                return cb.and(
                        cb.isNotNull(root.get("image")),
                        cb.notEqual(root.get("image"), "")
                );
            } else {
                return cb.or(
                        cb.isNull(root.get("image")),
                        cb.equal(root.get("image"), "")
                );
            }
        };
    }
}
