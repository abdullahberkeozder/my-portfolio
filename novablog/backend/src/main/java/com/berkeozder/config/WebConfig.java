package com.berkeozder.config;

import com.berkeozder.file_upload.FileProps;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.format.datetime.DateFormatter;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Web MVC configuration for static resource routing, CORS, and formatters.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final FileProps fileProps;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadRoot = fileProps.getUploadRoot().toAbsolutePath().normalize();

        try {
            Files.createDirectories(uploadRoot);
            Files.createDirectories(uploadRoot.resolve("blog"));
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to create upload directories at: " + uploadRoot, ex);
        }

        String uploadUri = uploadRoot.toUri().toString();
        if (!uploadUri.endsWith("/")) {
            uploadUri = uploadUri + "/";
        }

        registry
                .addResourceHandler("/upload/**", "/uploads/**")
                .addResourceLocations(uploadUri)
                .setCacheControl(CacheControl.noStore())
                .resourceChain(false);
    }

    @Override
    public void addCorsMappings(CorsRegistry corsRegistry) {
        corsRegistry
                .addMapping("/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("Content-Disposition", "Content-Type")
                .allowCredentials(true)
                .maxAge(3600);
    }

    @Override
    public void configureViewResolvers(ViewResolverRegistry viewResolverRegistry) {
        viewResolverRegistry.jsp("/WEB-INF/views/", ".jsp");
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addFormatter(new DateFormatter("yyyy-MM-dd"));
    }
}
