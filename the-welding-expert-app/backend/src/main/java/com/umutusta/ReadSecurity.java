package com.umutusta;

import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
class ReadSecurity {
    @Bean SecurityFilterChain apiSecurity(HttpSecurity http, @Value("${booking.writes.enabled:false}") boolean writes) throws Exception {
        if (writes) http.csrf(c -> c.ignoringRequestMatchers(
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST,"/api/v1/appointments"),
            PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST,"/api/v1/admin/appointments/*/confirm")));
        return http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(a -> {
                if (writes) a.requestMatchers(HttpMethod.POST,"/api/v1/appointments").permitAll()
                    .requestMatchers(HttpMethod.POST,"/api/v1/admin/appointments/*/confirm").authenticated();
                a
                .requestMatchers(HttpMethod.GET, "/api/v1/services", "/api/v1/availability").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/admin/appointments").authenticated()
                .anyRequest().denyAll(); })
            .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())).build();
    }
}
