package com.api.perpustakaan.service.user;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.dto.pustakawan.*;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserManagementServiceImpl implements UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PustakawanResponseDTO createPustakawan(PustakawanRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User pustakawan = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nip(request.getNip())
                .role(RoleConstant.PUSTAKAWAN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(pustakawan);

        return PustakawanResponseDTO.builder()
                .id(saved.getId())
                .name(saved.getName())
                .username(saved.getUsername())
                .email(saved.getEmail())
                .nip(saved.getNip())
                .role(saved.getRole())
                .build();
    }

    @Override
    public PustakawanResponseDTO updatePustakawan(Integer id, PustakawanRequestDTO request) {
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pustakawan not found"));

        existing.setName(request.getName());
        existing.setUsername(request.getUsername());
        existing.setEmail(request.getEmail());
        existing.setNip(request.getNip());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        existing.setUpdatedAt(LocalDateTime.now());

        User updated = userRepository.save(existing);

        return PustakawanResponseDTO.builder()
                .id(updated.getId())
                .name(updated.getName())
                .username(updated.getUsername())
                .email(updated.getEmail())
                .nip(updated.getNip())
                .role(updated.getRole())
                .build();
    }

    @Override
    public void deletePustakawan(Integer id) {
        User pustakawan = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pustakawan not found"));

        userRepository.delete(pustakawan); // hard delete
    }
}