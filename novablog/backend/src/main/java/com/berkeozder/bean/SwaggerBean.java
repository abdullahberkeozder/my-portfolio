package com.berkeozder.bean;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerBean {

    public static final String BASIC_AUTH_SCHEME = "basicAuth";
    public static final String BEARER_AUTH_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI getOpenAPIMethod() {
        return new OpenAPI()
                .info(new Info()
                        .title("NovaBlog Enterprise RESTful API")
                        .version("v1.0.0")
                        .description("Enterprise Full-Stack Blog Platform with Spring Boot 4.1.1, Java 22 Loom, Spring AI, and Redis Write-Behind Caching")
                        .contact(new Contact()
                                .name("Abdullah Berke Özder")
                                .email("abdullahberkeozder@gmail.com")
                                .url("https://github.com/abdullahberkeozder")
                        )
                        .license(new License()
                                .name("MIT License")
                                .url("https://github.com/abdullahberkeozder/my-portfolio")
                        ))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME))
                .addSecurityItem(new SecurityRequirement().addList(BASIC_AUTH_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH_SCHEME,
                                new SecurityScheme()
                                        .name(BEARER_AUTH_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Access Token: Obtain via /api/v1/auth/login and supply here."))
                        .addSecuritySchemes(BASIC_AUTH_SCHEME,
                                new SecurityScheme()
                                        .name(BASIC_AUTH_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("basic")
                                        .description("HTTP Basic Authentication for administrative endpoints.")));
    }
}
