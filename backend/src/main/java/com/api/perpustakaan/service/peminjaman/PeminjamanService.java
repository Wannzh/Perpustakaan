package com.api.perpustakaan.service.peminjaman;

import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestSelfDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanResponseDTO;

public interface PeminjamanService {
    PeminjamanResponseDTO createManual(PeminjamanRequestDTO request);
    PeminjamanResponseDTO createSelfPeminjaman(String username, PeminjamanRequestSelfDTO request);
}
