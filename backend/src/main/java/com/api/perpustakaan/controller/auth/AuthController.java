package com.api.perpustakaan.controller.auth;

import com.api.perpustakaan.dto.auth.LoginRequestDTO;
import com.api.perpustakaan.dto.auth.LoginResponseDTO;
import com.api.perpustakaan.service.auth.AuthService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

}