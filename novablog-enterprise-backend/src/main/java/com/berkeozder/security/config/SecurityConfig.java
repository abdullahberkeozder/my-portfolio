package com.berkeozder.security.config;

import com.berkeozder.security.jwt.JwtAuthenticationEntryPoint;
import com.berkeozder.security.jwt.JwtAuthenticationFilter;
import com.berkeozder.security.ratelimit.RateLimitFilter;
import com.berkeozder.security.userdetails.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;

@RequiredArgsConstructor
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final PasswordEncoder passwordEncoder;
    private final RateLimitFilter rateLimitFilter;
    private final com.berkeozder.security.oauth2.CustomOAuth2UserService customOAuth2UserService;
    private final com.berkeozder.security.oauth2.OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;
    private final com.berkeozder.security.oauth2.OAuth2AuthenticationFailureHandler oauth2AuthenticationFailureHandler;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /// ///////////////////////////////////////////////////////////////////
    /// WHITE_LIST
    private String[] whiteList() {
        return new String[]{
                "/",
                "/index",
                "/error",
                "/login",
                "/public/**",
                "/html/**",
                "/css/**",
                "/js/**",
                "/jsx/**",
                "/ts/**",
                "/images/**",
                "/webjars/**",
                "/assets/**",
                "/favicon.ico",
                "/api/v1/auth/**",
                "/api/v1/i18n/**",
                "/oauth2/**",
                "/login/oauth2/**",
                "/ws",
                "/ws/**",
                "/actuator/**"
        };
    }

    /// ///////////////////////////////////////////////////////////////////
    // SWAGGER_UI
    private String[] swaggerWhiteList() {
        return new String[]{
                "/swagger-ui.html",
                "/swagger-ui/**",
                "/v3/api-docs",
                "/v3/api-docs/**",
        };
    }

    /// ///////////////////////////////////////////////////////////////////
    // ADMIN
    private String[] adminMatchers() {
        return new String[]{
                "/admin",
                "/admin/**",
                "/api/admin/**",
        };
    }

    /// ///////////////////////////////////////////////////////////////////
    // SUPERADMIN
    private String[] superAdminMatchers() {
        return new String[]{
                "/super-admin",
                "/super-admin/**",
                "/api/super-admin/**",
        };
    }

    /// ///////////////////////////////////////////////////////////////////
    private RequestMatcher apiRequestMatcher() {
        return request -> {
            String uri = request.getRequestURI();
            if (uri == null) return false;

            return uri.startsWith("/api/")
                    || uri.startsWith("/rest/")
                    || uri.startsWith("/blog/api/")
                    || uri.startsWith("/blog/category/api/")
                    || uri.startsWith("/actuator/");
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity httpSecurity,
            @Value("${app.security.swagger-api-csrf-ignore:true}")
            boolean swaggerApiCsrfIgnore
    ) throws Exception {

        // H2 Console Matcher (H2 Console açık olsun veya olmasın güvenle çalışır)
        RequestMatcher h2Console = request -> request.getRequestURI() != null && request.getRequestURI().startsWith("/h2-console");

        // REST API Matcher
        RequestMatcher apiMatcher = apiRequestMatcher();

        // CSRF İstisnaları (REST API ve H2 Console)
        RequestMatcher apiCsrfIgnoreMatcher = request -> swaggerApiCsrfIgnore && apiMatcher.matches(request);

        httpSecurity
                .authenticationProvider(authenticationProvider())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(h2Console).permitAll()
                        .requestMatchers(swaggerWhiteList()).permitAll()
                        .requestMatchers(whiteList()).permitAll()

                        // Sadece Delete-All yetkisi SuperAdmin(+) verildi
                        .requestMatchers("/blog/api/v1.0.0/delete-all", "/blog/category/api/v1.0.0/delete-all")
                        .hasRole("SUPER_ADMIN")

                        // Yorumlar (Comments): Silinmişleri listeleme ve restore ADMIN yetkisindedir
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/comments/deleted").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/comments/*/restore").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/comments/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/comments/**").authenticated()
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/blog/api/v1.0.0/comments/**").authenticated()

                        // Etiketler (Tags): Herkese açık okuma, ADMIN/SUPER_ADMIN ekleme/düzenleme
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/tags/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/tags/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/blog/api/v1.0.0/tags/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Silinmiş Blogları Listeleme ve Geri Yükleme (Sadece ADMIN veya SUPER_ADMIN)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/deleted").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/restore/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Dışa Aktarma / Raporlama (Export Excel & CSV - Adım 13): Sadece ADMIN veya SUPER_ADMIN
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/export/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Gerçek Zamanlı Bildirimler (WebSocket / STOMP REST - Adım 18)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/notifications/types").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/notifications/test").permitAll()
                        .requestMatchers("/api/v1/notifications/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Spring Batch & ETL Automation (Adım 21)
                        .requestMatchers("/api/v1/batch/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Spring AI, Vektör Arama & Akıllı İçerik (Adım 22)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/ai/search/**").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/ai/summarize-text", "/api/v1/ai/suggest-tags", "/api/v1/ai/moderate").permitAll()
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/ai/summarize/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/v1/ai/reindex").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Blog ve Kategori Okuma (GET) herkese açık (Arama, listeleme, detay)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/blog/api/v1.0.0/**", "/blog/category/api/v1.0.0/**").permitAll()

                        // Çok Kriterli Filtreleme (POST /filter - Adım 14): Herkese açık arama sorgusu
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/filter").permitAll()

                        // CRUD write endpoints for blog and category (ADMIN veya SUPER_ADMIN)
                        .requestMatchers(org.springframework.http.HttpMethod.POST, "/blog/api/v1.0.0/**", "/blog/category/api/v1.0.0/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(org.springframework.http.HttpMethod.PUT, "/blog/api/v1.0.0/**", "/blog/category/api/v1.0.0/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(org.springframework.http.HttpMethod.PATCH, "/blog/api/v1.0.0/**", "/blog/category/api/v1.0.0/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/blog/api/v1.0.0/**", "/blog/category/api/v1.0.0/**")
                        .hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // Süper Admin ve Admin sayfaları
                        .requestMatchers(superAdminMatchers()).hasRole("SUPER_ADMIN")
                        .requestMatchers(adminMatchers()).hasAnyRole("ADMIN", "SUPER_ADMIN")

                        .anyRequest().authenticated()
                )

                // CSRF Yönetimi: REST API'ler ve H2 Console CSRF kontrolünden muaf tutulur
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers(h2Console, apiCsrfIgnoreMatcher)
                        .ignoringRequestMatchers("/api/v1/auth/**", "/api/v1/i18n/**", "/api/v1/notifications/**", "/blog/api/**", "/blog/category/api/**", "/ws", "/ws/**", "/oauth2/**", "/login/oauth2/**")
                )

                // H2 Console iframe için SAMEORIGIN
                .headers(headers -> headers
                        .frameOptions(frame -> frame.sameOrigin())
                )

                // Hız Sınırlama (Rate Limiting) Filtresini en başta çalıştır (Brute-Force & DoS Koruması)
                .addFilterBefore(rateLimitFilter, org.springframework.security.web.context.SecurityContextHolderFilter.class)

                // JWT Filtresini UsernamePasswordAuthenticationFilter'dan önce çalıştır
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                // Yetkisiz REST çağrılarında 401 Unauthorized ve JSON ApiResult döndür
                .exceptionHandling(exception -> exception
                        .defaultAuthenticationEntryPointFor(jwtAuthenticationEntryPoint, apiMatcher)
                )

                // OAuth2 & OpenID Connect Sosyal Giriş (Google & GitHub - Adım 19)
                .oauth2Login(oauth2 -> oauth2
                        .authorizationEndpoint(auth -> auth
                                .baseUri("/oauth2/authorization")
                        )
                        .redirectionEndpoint(redirection -> redirection
                                .baseUri("/login/oauth2/code/*")
                        )
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oauth2AuthenticationSuccessHandler)
                        .failureHandler(oauth2AuthenticationFailureHandler)
                )

                .formLogin(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults())
                .logout(Customizer.withDefaults());

        return httpSecurity.build();
    }
}
