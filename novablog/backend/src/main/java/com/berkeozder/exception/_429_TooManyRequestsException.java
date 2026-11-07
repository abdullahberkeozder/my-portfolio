package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Status Code : 429
// TOO_MANY_REQUESTS : Çok Fazla İstek (Rate Limit Aşıldı)
@ResponseStatus(value = HttpStatus.TOO_MANY_REQUESTS)
public class _429_TooManyRequestsException extends RuntimeException {

    public _429_TooManyRequestsException(String message) {
        super(message);
    }
}

