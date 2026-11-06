package com.berkeozder.security.ratelimit;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

/**
 * Rate limit kontrolünün sonucunu taşıyan DTO nesnesi.
 *
 * @author Berke Özder
 */
@Getter
@Builder
@ToString
public class RateLimitResult {

    private final boolean allowed;
    private final long capacity;
    private final long remainingTokens;
    private final long retryAfterSeconds;
}

