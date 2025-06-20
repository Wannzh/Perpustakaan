package com.api.perpustakaan.service.auth;

import com.api.perpustakaan.dto.auth.LoginRequestDTO;
import com.api.perpustakaan.dto.auth.LoginResponseDTO;

public interface AuthService {
    LoginResponseDTO login(LoginRequestDTO request);
}
