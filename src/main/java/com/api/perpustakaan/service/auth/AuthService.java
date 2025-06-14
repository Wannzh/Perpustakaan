package com.api.perpustakaan.service.auth;

import com.api.perpustakaan.dto.auth.LoginRequestDTO;
import com.api.perpustakaan.dto.auth.LoginResponseDTO;
import com.api.perpustakaan.dto.auth.RegisterRequestDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
    LoginResponseDTO register(RegisterRequestDTO request);
}
