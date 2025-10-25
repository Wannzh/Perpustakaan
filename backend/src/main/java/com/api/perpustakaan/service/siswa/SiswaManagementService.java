package com.api.perpustakaan.service.siswa;

import java.util.List;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import com.api.perpustakaan.dto.siswa.SiswaRequestDTO;
import com.api.perpustakaan.dto.siswa.SiswaResponseDTO;

public interface SiswaManagementService {
    SiswaResponseDTO createSiswa(SiswaRequestDTO request);
    SiswaResponseDTO updateSiswa(UUID id, SiswaRequestDTO request, Boolean isActive);
    void updateStatusAktif(UUID siswaId, boolean isActive);
    void deleteSiswa(UUID id);
    List<SiswaResponseDTO> getAllSiswa();
    List<SiswaResponseDTO> searchSiswaByName(String name);
    List<SiswaResponseDTO> searchSiswaByNis(String nis);
    void uploadSiswaBatch(MultipartFile file);
}
