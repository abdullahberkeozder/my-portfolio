package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Status Code : 403
// FORBIDDEN   : Yasaklandı
@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class _403_ForbiddenException extends RuntimeException {

    public _403_ForbiddenException(String message) {
        super(message);
    }
}
