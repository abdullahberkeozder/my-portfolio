package com.berkeozder.runner;

import com.berkeozder.data.entity.BlogCategoryEntity;
import com.berkeozder.data.entity.BlogEntity;
import com.berkeozder.data.repository.IBlogCategoryRepository;
import com.berkeozder.data.repository.IBlogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.UUID;

@Log4j2
@RequiredArgsConstructor
@Configuration
@Order(1)
public class _1_Blog_BlogCategory {

    private final IBlogCategoryRepository iBlogCategoryRepository;
    private final IBlogRepository iBlogRepository;

    @Bean
    public CommandLineRunner blogCommandLineRunnerMethod() {
        return args -> {
            if (iBlogRepository.count() > 0) {
                log.info("Başlangıç blog verileri zaten mevcut, seeder atlanıyor.");
                return;
            }
            log.info("Başlangıç kategorileri ve blog verileri oluşturuluyor...");

            BlogCategoryEntity computerCategory = new BlogCategoryEntity();
            computerCategory.setCategoryName("Yazılım & Teknoloji " + UUID.randomUUID().toString().substring(0, 8));
            iBlogCategoryRepository.save(computerCategory);

            BlogCategoryEntity mobileCategory = new BlogCategoryEntity();
            mobileCategory.setCategoryName("Mobil & Bulut " + UUID.randomUUID().toString().substring(0, 8));
            iBlogCategoryRepository.save(mobileCategory);

            BlogEntity blogEntity1 = BlogEntity.builder()
                    .header("Header-1")
                    .title("Title-1")
                    .content("Content-1")
                    .blogCategoryEntity(computerCategory)
                    .build();
            iBlogRepository.save(blogEntity1);

            BlogEntity blogEntity2 = BlogEntity.builder()
                    .header("Header-2")
                    .title("Title-2")
                    .content("Content-2")
                    .blogCategoryEntity(computerCategory)
                    .build();
            iBlogRepository.save(blogEntity2);

            BlogEntity blogEntity3 = BlogEntity.builder()
                    .header("Header-3")
                    .title("Title-3")
                    .content("Content-3")
                    .blogCategoryEntity(mobileCategory)
                    .build();
            iBlogRepository.save(blogEntity3);

            log.info("Başlangıç blog ve kategori verileri başarıyla oluşturuldu.");
        };
    }
}
