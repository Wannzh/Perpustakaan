package com.api.perpustakaan.service.user;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.api.perpustakaan.dto.pustakawan.*;

public interface UserManagementService {
    // Admin (Kepala Pustakawan)
    PustakawanResponseDTO createPustakawan(PustakawanRequestDTO request);
    PustakawanResponseDTO updatePustakawan(Integer id, PustakawanRequestDTO request);
    void deletePustakawan(Integer id);
    List<PustakawanResponseDTO> getAllPustakawan();
    List<PustakawanResponseDTO> searchPustakawanByName(String name);
    List<PustakawanResponseDTO> searchPustakawanByNip(String nip);
    // Add Full Nama Pustakawan
    void uploadPustakawanBatch(MultipartFile file);


}
