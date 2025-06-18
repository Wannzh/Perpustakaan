package com.api.perpustakaan.service.user;

import java.util.List;

import com.api.perpustakaan.dto.pustakawan.*;

public interface UserManagementService {
    PustakawanResponseDTO createPustakawan(PustakawanRequestDTO request);
    PustakawanResponseDTO updatePustakawan(Integer id, PustakawanRequestDTO request);
    void deletePustakawan(Integer id);
    List<PustakawanResponseDTO> getAllPustakawan();
    List<PustakawanResponseDTO> searchPustakawanByName(String name);
    List<PustakawanResponseDTO> searchPustakawanByNip(String nip);
}
