package com.flogin.exception;

import org.springframework.http.HttpStatus;

public class AuthException extends RuntimeException {
    private HttpStatus status;

    public AuthException (String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus geHttpStatus() {
        return status;
    }
}
