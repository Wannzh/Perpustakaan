package com.api.perpustakaan.dto.peminjaman;

import java.time.LocalDate;
import java.util.UUID;

import com.api.perpustakaan.constant.ReturnStatusConstant;
import com.api.perpustakaan.constant.StatusConstant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PeminjamanResponseDTO {
    private Integer id;
    private UUID idSiswa;
    private String namaSiswa;
    private String judulBuku;
    private LocalDate tanggalPinjam;
    private LocalDate tanggalJatuhTempo;
    private LocalDate tanggalKembali;
    private StatusConstant status;
    private ReturnStatusConstant statusPengembalian;
    private Integer denda;
    private Integer rating;
}
