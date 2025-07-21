package com.api.perpustakaan.service.user;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.dto.pustakawan.*;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
    public PustakawanResponseDTO updatePustakawan(UUID id, PustakawanRequestDTO request) {
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
    public void deletePustakawan(UUID id) {
        User pustakawan = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pustakawan not found"));

        userRepository.delete(pustakawan);
    }

    @Override
    public List<PustakawanResponseDTO> getAllPustakawan() {
        return userRepository.findByRole(RoleConstant.PUSTAKAWAN)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<PustakawanResponseDTO> searchPustakawanByName(String name) {
        return userRepository.findByRoleAndNameContainingIgnoreCase(RoleConstant.PUSTAKAWAN, name)
                .stream().map(this::mapToResponse).toList();
    }

    @Override
    public List<PustakawanResponseDTO> searchPustakawanByNip(String nip) {
        return userRepository.findByRoleAndNipContainingIgnoreCase(RoleConstant.PUSTAKAWAN, nip)
                .stream().map(this::mapToResponse).toList();
    }

    // Reusable method
    private PustakawanResponseDTO mapToResponse(User u) {
        return PustakawanResponseDTO.builder()
                .id(u.getId())
                .name(u.getName())
                .username(u.getUsername())
                .email(u.getEmail())
                .nip(u.getNip())
                .role(u.getRole())
                .build();
    }

    @Override
    @Transactional
    public void uploadPustakawanBatch(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new RuntimeException("Filename tidak ditemukan");
        }

        if (filename.endsWith(".xlsx")) {
            processExcel(file);
        } else if (filename.endsWith(".csv")) {
            processCsv(file);
        } else {
            throw new RuntimeException("Format file tidak didukung: " + filename);
        }
    }

    private void processExcel(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null)
                    continue;

                String name = row.getCell(0).getStringCellValue();
                String username = row.getCell(1).getStringCellValue();
                String password = row.getCell(2).getStringCellValue();
                String email = row.getCell(3).getStringCellValue();
                String nip = row.getCell(4).getStringCellValue();

                saveUserIfNotExists(name, username, password, email, nip);
            }
        } catch (Exception e) {
            throw new RuntimeException("Gagal memproses file Excel", e);
        }
    }

    private void processCsv(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                if (lineNumber++ == 0)
                    continue; // skip header

                String[] columns = line.split(",");
                if (columns.length < 5)
                    continue;

                String name = columns[0].trim();
                String username = columns[1].trim();
                String password = columns[2].trim();
                String email = columns[3].trim();
                String nip = columns[4].trim();

                saveUserIfNotExists(name, username, password, email, nip);
            }
        } catch (Exception e) {
            throw new RuntimeException("Gagal memproses file CSV", e);
        }
    }

    private void saveUserIfNotExists(String name, String username, String password, String email, String nip) {
        if (userRepository.existsByUsername(username))
            return;

        User pustakawan = User.builder()
                .name(name)
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .nip(nip)
                .role(RoleConstant.PUSTAKAWAN)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(pustakawan);
    }

}