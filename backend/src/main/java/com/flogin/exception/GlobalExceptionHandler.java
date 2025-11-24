package com.flogin.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.flogin.dto.login.LoginResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private String defaultMessage = "Lỗi hệ thống";

    private ResponseEntity<ErrorResponse> errorData(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(new ErrorResponse(status.value(), message));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        return errorData(HttpStatus.BAD_REQUEST,
                ex.getBindingResult().getAllErrors().getFirst().getDefaultMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NotFoundException ex) {
        return errorData(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ExistsException.class)
    public ResponseEntity<ErrorResponse> handleExists(ExistsException ex) {
        return errorData(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<LoginResponse> handleAuth(AuthException ex) {
        return ResponseEntity.status(ex.geHttpStatus()).body(new LoginResponse(ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception ex) {
        return errorData(HttpStatus.INTERNAL_SERVER_ERROR, defaultMessage);
    }
}