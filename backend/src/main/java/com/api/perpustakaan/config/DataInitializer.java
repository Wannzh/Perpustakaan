package com.api.perpustakaan.config;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.UUID;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String defaultUsername = "admin";
        if (userRepository.existsByUsername(defaultUsername)) {
            return; // Sudah ada admin
        }

        User admin = User.builder()
                .id(UUID.randomUUID())
                .name("Admin Perpustakaan")
                .username(defaultUsername)
                .password(passwordEncoder.encode("admin123"))
                .email("admin@perpustakaan.com")
                .nip("1987654321")
                .role(RoleConstant.KEPALA)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        System.out.println("Akun Admin Perpustakaan berhasil dibuat (username: admin, password: admin123)");
    }
}