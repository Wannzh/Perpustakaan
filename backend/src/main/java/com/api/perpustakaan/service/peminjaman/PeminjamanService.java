package com.api.perpustakaan.service.peminjaman;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.PageResponse;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestSelfDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanResponseDTO;

public interface PeminjamanService {
    PeminjamanResponseDTO createManual(PeminjamanRequestDTO request);

    PeminjamanResponseDTO createSelfPeminjaman(String username, PeminjamanRequestSelfDTO request);

    PageResponse<PeminjamanResponseDTO> getAllPeminjamanForPustakawan(int page, int size, String keyword,
            StatusConstant status, String sortBy, String direction);

    void giveRating(Integer transactionId, Integer rating, String username);

}
