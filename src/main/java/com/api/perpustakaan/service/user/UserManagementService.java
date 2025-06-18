package com.api.perpustakaan.service.user;

import com.api.perpustakaan.dto.pustakawan.*;

public interface UserManagementService {
    PustakawanResponseDTO createPustakawan(PustakawanRequestDTO request);
    PustakawanResponseDTO updatePustakawan(Integer id, PustakawanRequestDTO request);
    void deletePustakawan(Integer id);
}
