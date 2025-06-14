package com.api.perpustakaan.service.auth;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.dto.auth.LoginRequestDTO;
import com.api.perpustakaan.dto.auth.LoginResponseDTO;
import com.api.perpustakaan.dto.auth.RegisterRequestDTO;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.exception.CustomInvalidCredentialsException;
import com.api.perpustakaan.repository.user.UserRepository;
import com.api.perpustakaan.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomInvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        return LoginResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .token(token)
                .build();
    }

    @Override
    public LoginResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nip(request.getNip())
                .nis(request.getNis())
                .userClass(request.getUserClass())
                .role(request.getRole() != null ? request.getRole() : RoleConstant.SISWA)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        return LoginResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}