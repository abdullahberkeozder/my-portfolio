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

// LOMBOK
// LOMBOK
@RequiredArgsConstructor
@Log4j2
@Configuration
@Order(1) // Runner Sırası
public class _1_Blog_BlogCategory {

    // INJECTION
    // 1.YOL
    private final IBlogCategoryRepository iBlogCategoryRepository;
    private final IBlogRepository iBlogRepository ;

    // FIRST
    public void blogCommandLineRunnerAfterBeanMethod(){
        log.info("blog CommandLineRunner After Bean Method başladı");
        System.out.println("blog CommandLineRunner After Bean Method başladı");
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Injection
    // CommandLineRunner Metodunu çağırdım
    @Bean
    public CommandLineRunner blogCommandLineRunnerMethod() {
        // Lambda Expression
        return args -> {
            if (iBlogRepository.count() > 0) {
                log.info("Başlangıç blog verileri zaten mevcut, seeder atlanıyor.");
                return;
            }
            System.out.println("CommandLineRunner Çalıştı");
            log.info("Category-Blog CommandLineRunner Çalıştı");
            // Kategoriler Oluştur

            // Tekil Kategory
            BlogCategoryEntity computerCategory=new BlogCategoryEntity();
            computerCategory.setCategoryName("Public Server"+ UUID.randomUUID().toString());
            iBlogCategoryRepository.save(computerCategory);

            // Tekil Kategory
            BlogCategoryEntity tabletCategory=new BlogCategoryEntity();
            tabletCategory.setCategoryName("Tablet"+UUID.randomUUID().toString());
            iBlogCategoryRepository.save(tabletCategory);

            // Blog-1
            BlogEntity blogEntity1=new BlogEntity();
            blogEntity1.setHeader("Header-1");
            blogEntity1.setContent("Content-1");
            blogEntity1.setTitle("Title-1");
            blogEntity1.setBlogCategoryEntity((computerCategory));
            iBlogRepository.save(blogEntity1);

            // Blog-1
            BlogEntity blogEntity2=new BlogEntity();
            blogEntity2.setHeader("Header-2");
            blogEntity2.setContent("Content-2");
            blogEntity2.setTitle("Title-2");
            blogEntity2.setBlogCategoryEntity(computerCategory);
            iBlogRepository.save(blogEntity2);


            // Blog-2
            BlogEntity blogEntity3=new BlogEntity();
            blogEntity3.setHeader("Header-3");
            blogEntity3.setContent("Content-3");
            blogEntity3.setTitle("Title-3");
            blogEntity3.setBlogCategoryEntity(tabletCategory);
            iBlogRepository.save(blogEntity3);
        };
    } //end CommandLineRunner

} // _2_ProjectDataSet
