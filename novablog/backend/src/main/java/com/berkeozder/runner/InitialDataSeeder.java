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

/**
 * Initial database seeder populating baseline categories and blogs when repository is empty.
 */
@Configuration
@Order(1)
@RequiredArgsConstructor
@Log4j2
public class InitialDataSeeder {

    private final IBlogCategoryRepository iBlogCategoryRepository;
    private final IBlogRepository iBlogRepository;

    @Bean
    public CommandLineRunner initialBlogDataSeederRunner() {
        return args -> {
            if (iBlogRepository.count() > 0) {
                log.info("Initial blog data already exists, skipping seeder.");
                return;
            }

            log.info("Running initial blog data seeder...");

            BlogCategoryEntity computerCategory = new BlogCategoryEntity();
            computerCategory.setCategoryName("Architecture-" + UUID.randomUUID().toString().substring(0, 8));
            iBlogCategoryRepository.save(computerCategory);

            BlogCategoryEntity tabletCategory = new BlogCategoryEntity();
            tabletCategory.setCategoryName("Cloud-Native-" + UUID.randomUUID().toString().substring(0, 8));
            iBlogCategoryRepository.save(tabletCategory);

            BlogEntity blog1 = new BlogEntity();
            blog1.setHeader("Building Resilient Systems with Java 22");
            blog1.setTitle("Java 22 Virtual Threads & High Concurrency");
            blog1.setContent("Deep dive into Project Loom virtual threads and how they scale Spring Boot I/O bound workloads.");
            blog1.setBlogCategoryEntity(computerCategory);
            iBlogRepository.save(blog1);

            BlogEntity blog2 = new BlogEntity();
            blog2.setHeader("Distributed Caching Patterns with Redis 7");
            blog2.setTitle("Two-Tier Caching Architecture");
            blog2.setContent("Exploration of L1 Caffeine and L2 Redis caching with real-time invalidation strategies.");
            blog2.setBlogCategoryEntity(computerCategory);
            iBlogRepository.save(blog2);

            BlogEntity blog3 = new BlogEntity();
            blog3.setHeader("Semantic Retrieval with pgvector & Spring AI");
            blog3.setTitle("Hybrid Search with Reciprocal Rank Fusion");
            blog3.setContent("Combining full-text lexical search with dense vector similarity in modern content platforms.");
            blog3.setBlogCategoryEntity(tabletCategory);
            iBlogRepository.save(blog3);

            log.info("Initial blog data seeding completed.");
        };
    }
}

