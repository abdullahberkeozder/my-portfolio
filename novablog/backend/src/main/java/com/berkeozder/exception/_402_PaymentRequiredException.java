package com.berkeozder.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.PAYMENT_REQUIRED)
public class _402_PaymentRequiredException extends NovaBlogException {

    public _402_PaymentRequiredException(String message) {
        super(message);
    }
}
