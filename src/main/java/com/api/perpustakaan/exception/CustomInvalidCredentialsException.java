package com.api.perpustakaan.exception;

public class CustomInvalidCredentialsException extends RuntimeException {
    public CustomInvalidCredentialsException() {
        super("Username or Password is incorrect!");
    }
}
