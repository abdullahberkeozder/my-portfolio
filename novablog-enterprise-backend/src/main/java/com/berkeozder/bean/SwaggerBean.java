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

    // Basic Auth
    public static final String BASIC_AUTH_SCHEME = "basicAuth";

    // JWT Bearer Auth
    public static final String BEARER_AUTH_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI getOpenAPIMethod() {
        return new OpenAPI()
                .info(new Info()
                        .title("Spring Boot 2026 RESTful API")
                        .version("V1.0.0")
                        .description("Spring Boot 3, PostgreSQL, Docker ve JWT Destekli Kurumsal Blog API")
                        .termsOfService("Software INC")
                        .contact(new Contact()
                                .name("Berke Özder")
                                .email("berkeozder@gmail.com")
                                .url("https://github.com/berkeozder")
                        )
                        .license(new License()
                                .name("MIT")
                                .url("https://github.com/berkeozder")
                        ))
                // Güvenlik Gereksinimleri (JWT ve Basic Auth)
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH_SCHEME))
                .addSecurityItem(new SecurityRequirement().addList(BASIC_AUTH_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH_SCHEME,
                                new SecurityScheme()
                                        .name(BEARER_AUTH_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Access Token: /api/v1/auth/login adresinden aldığınız token'ı buraya yapıştırınız."))
                        .addSecuritySchemes(BASIC_AUTH_SCHEME,
                                new SecurityScheme()
                                        .name(BASIC_AUTH_SCHEME)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("basic")
                                        .description("Basic Authentication: admin / root veya superadmin / root")));
    } //end getOpenAPIMethod
} //end class
