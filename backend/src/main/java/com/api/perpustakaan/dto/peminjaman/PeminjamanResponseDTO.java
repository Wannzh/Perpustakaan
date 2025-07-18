package com.api.perpustakaan.dto.peminjaman;

import java.time.LocalDate;

import com.api.perpustakaan.constant.StatusConstant;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PeminjamanResponseDTO {
    private Integer id;
    private String namaSiswa;
    private String judulBuku;
    private LocalDate tanggalPinjam;
    private LocalDate tanggalJatuhTempo;
    private StatusConstant status;
}
