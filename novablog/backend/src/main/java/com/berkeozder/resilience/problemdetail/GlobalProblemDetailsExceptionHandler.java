package com.berkeozder.resilience.problemdetail;

import com.berkeozder.error.ApiResult;
import com.berkeozder.exception.*;
import io.github.resilience4j.bulkhead.BulkheadFullException;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Enterprise RFC 7807 Problem Details Global Exception Handler.
 * Resilience4j devre kesici, eşzamanlılık sınırı ve iş kuralı hatalarını
 * modern endüstri standardı RFC 7807 ProblemDetail şemasıyla döner.
 *
 * @author Berke Özder
 */
@Log4j2
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE + 50)
public class GlobalProblemDetailsExceptionHandler {

    private static final String BASE_ERROR_URI = "https://novablog.com/errors/";

    // 1. Resilience4j Circuit Breaker OPEN Hatası
    @ExceptionHandler(CallNotPermittedException.class)
    public ResponseEntity<ProblemDetail> handleCircuitBreakerOpen(CallNotPermittedException ex, HttpServletRequest request) {
        log.warn("⚡ [RESILIENCE4J] İstek CircuitBreaker tarafından engellendi: {}", ex.getMessage());

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Bağlı harici servis geçici olarak yanıt vermiyor. Devre kesici [" + ex.getCausingCircuitBreakerName() + "] devreyi kesti."
        );
        problem.setType(URI.create(BASE_ERROR_URI + "circuit-breaker-open"));
        problem.setTitle("Service Temporarily Unavailable");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("circuitBreakerName", ex.getCausingCircuitBreakerName());
        problem.setProperty("resilienceAction", "CIRCUIT_BREAKER_OPEN");

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 2. Resilience4j Bulkhead Kapasite Doluluk Hatası
    @ExceptionHandler(BulkheadFullException.class)
    public ResponseEntity<ProblemDetail> handleBulkheadFull(BulkheadFullException ex, HttpServletRequest request) {
        log.warn("⚡ [RESILIENCE4J] Bulkhead kapasitesi aşıldı: {}", ex.getMessage());

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.TOO_MANY_REQUESTS,
                "Sunucu şu anda izin verilen maksimum eşzamanlı AI/arka plan işlemi kapasitesine ulaştı. Lütfen kısa bir süre sonra tekrar deneyin."
        );
        problem.setType(URI.create(BASE_ERROR_URI + "bulkhead-full"));
        problem.setTitle("Concurrency Limit Reached");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("resilienceAction", "BULKHEAD_REJECTED");

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 3. Resilience4j RateLimiter Hatası
    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<ProblemDetail> handleRateLimitNotPermitted(RequestNotPermitted ex, HttpServletRequest request) {
        log.warn("⚡ [RESILIENCE4J] RateLimiter sınırı aşıldı: {}", ex.getMessage());

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.TOO_MANY_REQUESTS,
                "İstek sıklık sınırı aşıldı. Lütfen istek gönderme hızınızı düşürün."
        );
        problem.setType(URI.create(BASE_ERROR_URI + "rate-limit-exceeded"));
        problem.setTitle("Too Many Requests");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 4. Spring Validation Doğrulama Hataları
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ProblemDetail> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "İstek gövdesindeki veriler doğrulama kurallarından geçemedi."
        );
        problem.setType(URI.create(BASE_ERROR_URI + "validation-error"));
        problem.setTitle("Validation Failed");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());
        problem.setProperty("errors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 5. Özel BerkeOzder 404 Not Found
    @ExceptionHandler(_404_NotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(_404_NotFoundException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                ex.getMessage()
        );
        problem.setType(URI.create(BASE_ERROR_URI + "resource-not-found"));
        problem.setTitle("Resource Not Found");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 6. Özel BerkeOzder 400 Bad Request
    @ExceptionHandler(_400_BadRequestException.class)
    public ResponseEntity<ProblemDetail> handleBadRequest(_400_BadRequestException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problem.setType(URI.create(BASE_ERROR_URI + "bad-request"));
        problem.setTitle("Bad Request");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }

    // 7. Özel BerkeOzder 403 Forbidden
    @ExceptionHandler(_403_ForbiddenException.class)
    public ResponseEntity<ProblemDetail> handleForbidden(_403_ForbiddenException ex, HttpServletRequest request) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.FORBIDDEN,
                ex.getMessage()
        );
        problem.setType(URI.create(BASE_ERROR_URI + "forbidden"));
        problem.setTitle("Access Forbidden");
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("timestamp", Instant.now().toString());

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .contentType(MediaType.APPLICATION_PROBLEM_JSON)
                .body(problem);
    }
}
