package com.berkeozder.resilience.idempotency;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Idempotency anahtarına bağlı istek ve yanıt kaydı.
 * Dağıtık Redis önbelleğinde veya bellek içi depoda tutulur.
 *
 * @author Berke Özder
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdempotencyRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    private String key;
    private IdempotencyStatus status;
    private int statusCode;
    private String contentType;
    private String responseBody;
    private long createdAt;
}
