package com.api.perpustakaan.dto.peminjaman;

import java.time.LocalDate;
import java.util.UUID;

import lombok.Data;

@Data
public class PeminjamanRequestDTO {
    private UUID siswaId;
    private Integer bukuId;
    private LocalDate tanggalPinjam;
    private LocalDate tanggalJatuhTempo;
}
