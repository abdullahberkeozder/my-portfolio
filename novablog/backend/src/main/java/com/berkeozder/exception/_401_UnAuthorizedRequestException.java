package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Status Code : 401
// UNAUTHORIZED : Yetkisiz Giriş
@ResponseStatus(value = HttpStatus.UNAUTHORIZED)
public class _401_UnAuthorizedRequestException extends RuntimeException {

    public _401_UnAuthorizedRequestException(String message) {
        super(message);
    }
}
