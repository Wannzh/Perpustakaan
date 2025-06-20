package com.api.perpustakaan.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.AllArgsConstructor;
import lombok.Getter;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(CustomInvalidCredentialsException.class)
    public ResponseEntity<?> handleInvalidCredentials(CustomInvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("error", ex.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("error", ex.getMessage()));
    }

    @Getter
    @AllArgsConstructor
    public static class ErrorResponse {
        private String status;
        private String message;
    }
}