package com.berkeozder;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

@EnableJpaAuditing(auditorAwareRef = "auditingAwareBeanMethod")
@SpringBootApplication
public class SpringBoot2026Application {

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("Europe/Istanbul"));
    }

    public static void main(String[] args) {
        SpringApplication.run(SpringBoot2026Application.class, args);
    }
}
