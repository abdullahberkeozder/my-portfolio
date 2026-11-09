package com.berkeozder.resilience.config;

import io.github.resilience4j.bulkhead.BulkheadRegistry;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.retry.RetryRegistry;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

/**
 * Resilience4j Yaşam Döngüsü ve Olay Dinleyicisi.
 * CircuitBreaker durum geçişlerini (CLOSED -> OPEN -> HALF_OPEN),
 * Retry denemelerini ve Bulkhead doluluklarını operasyonel olarak loglar ve izler.
 *
 * @author Berke Özder
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class ResilienceEventListener {

    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final RetryRegistry retryRegistry;
    private final BulkheadRegistry bulkheadRegistry;

    @PostConstruct
    public void registerListeners() {
        // Circuit Breaker Event Listeners
        circuitBreakerRegistry.getAllCircuitBreakers().forEach(cb -> {
            cb.getEventPublisher()
                    .onStateTransition(event -> log.warn(
                            "⚡ [RESILIENCE4J] CircuitBreaker [{}] Durum Değişimi: {} -> {}",
                            cb.getName(),
                            event.getStateTransition().getFromState(),
                            event.getStateTransition().getToState()
                    ))
                    .onError(event -> log.warn(
                            "⚠️ [RESILIENCE4J] CircuitBreaker [{}] Hata Kaydetti: {} (Süre: {}ms)",
                            cb.getName(),
                            event.getThrowable().getMessage(),
                            event.getElapsedDuration().toMillis()
                    ))
                    .onReset(event -> log.info(
                            "✅ [RESILIENCE4J] CircuitBreaker [{}] Sıfırlandı (Normal çalışma)",
                            cb.getName()
                    ));
        });

        // Retry Event Listeners
        retryRegistry.getAllRetries().forEach(retry -> {
            retry.getEventPublisher()
                    .onRetry(event -> log.warn(
                            "🔄 [RESILIENCE4J] Retry [{}] Deneme #{}: Hata: {}",
                            retry.getName(),
                            event.getNumberOfRetryAttempts(),
                            event.getLastThrowable().getMessage()
                    ))
                    .onSuccess(event -> {
                        if (event.getNumberOfRetryAttempts() > 0) {
                            log.info(
                                    "✅ [RESILIENCE4J] Retry [{}] #{} denemeden sonra başarılı oldu",
                                    retry.getName(),
                                    event.getNumberOfRetryAttempts()
                            );
                        }
                    });
        });

        // Bulkhead Event Listeners
        bulkheadRegistry.getAllBulkheads().forEach(bulkhead -> {
            bulkhead.getEventPublisher()
                    .onCallRejected(event -> log.warn(
                            "⛔ [RESILIENCE4J] Bulkhead [{}] Kapasite Doldu! Eşzamanlı istek reddedildi.",
                            bulkhead.getName()
                    ));
        });

        log.info("Resilience4j gözlemlenebilirlik dinleyicileri başarıyla kaydedildi.");
    }
}
