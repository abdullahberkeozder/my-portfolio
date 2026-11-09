package com.berkeozder.resilience.idempotency;

/**
 * Idempotency işlem durumları.
 *
 * @author Berke Özder
 */
public enum IdempotencyStatus {
    PROCESSING,
    COMPLETED
}
