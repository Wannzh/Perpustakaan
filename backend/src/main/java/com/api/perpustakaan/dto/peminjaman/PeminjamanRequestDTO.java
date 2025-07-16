package com.api.perpustakaan.dto.peminjaman;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PeminjamanRequestDTO {
    private Integer siswaId;
    private Integer bukuId;
    private LocalDate tanggalPinjam;
    private LocalDate tanggalJatuhTempo;
    private String catatan;
}
