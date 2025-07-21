package com.api.perpustakaan.service.siswa;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.dto.siswa.*;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SiswaManagementServiceImpl implements SiswaManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public SiswaResponseDTO createSiswa(SiswaRequestDTO request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        User siswa = User.builder()
                .name(request.getName())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .nis(request.getNis())
                .userClass(request.getUserClass())
                .role(RoleConstant.SISWA)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User saved = userRepository.save(siswa);
        return mapToResponse(saved);
    }

    @Override
    public SiswaResponseDTO updateSiswa(UUID id, SiswaRequestDTO request) {
        User siswa = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Siswa not found"));
        siswa.setName(request.getName());
        siswa.setUsername(request.getUsername());
        siswa.setEmail(request.getEmail());
        siswa.setNis(request.getNis());
        siswa.setUserClass(request.getUserClass());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            siswa.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        siswa.setUpdatedAt(LocalDateTime.now());
        return mapToResponse(userRepository.save(siswa));
    }

    @Override
    public void deleteSiswa(UUID id) {
        User siswa = userRepository.findById(id).orElseThrow(() -> new RuntimeException("Siswa not found"));
        userRepository.delete(siswa);
    }

    @Override
    public List<SiswaResponseDTO> getAllSiswa() {
        return userRepository.findByRole(RoleConstant.SISWA).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<SiswaResponseDTO> searchSiswaByName(String name) {
        return userRepository.findByRoleAndNameContainingIgnoreCase(RoleConstant.SISWA, name).stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<SiswaResponseDTO> searchSiswaByNis(String nis) {
        return userRepository.findByRoleAndNisContainingIgnoreCase(RoleConstant.SISWA, nis).stream().map(this::mapToResponse).toList();
    }

    private SiswaResponseDTO mapToResponse(User u) {
        return SiswaResponseDTO.builder()
                .id(u.getId())
                .name(u.getName())
                .username(u.getUsername())
                .email(u.getEmail())
                .nis(u.getNis())
                .userClass(u.getUserClass())
                .role(u.getRole())
                .build();
    }

    @Override
    public void uploadSiswaBatch(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = row.getCell(0).getStringCellValue();
                String username = row.getCell(1).getStringCellValue();
                String password = row.getCell(2).getStringCellValue();
                String email = row.getCell(3).getStringCellValue();
                String nis = row.getCell(4).getStringCellValue();
                String userClass = row.getCell(5).getStringCellValue();

                if (userRepository.existsByUsername(username)) continue;

                User siswa = User.builder()
                        .name(name)
                        .username(username)
                        .password(passwordEncoder.encode(password))
                        .email(email)
                        .nis(nis)
                        .userClass(userClass)
                        .role(RoleConstant.SISWA)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                userRepository.save(siswa);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process file", e);
        }
    }
}
