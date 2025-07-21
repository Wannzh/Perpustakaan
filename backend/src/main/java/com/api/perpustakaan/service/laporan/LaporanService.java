package com.api.perpustakaan.service.laporan;

import java.time.LocalDate;
import java.util.List;

import com.api.perpustakaan.dto.laporan.BukuTerpopulerDTO;
import com.api.perpustakaan.dto.laporan.SiswaTerlambatDTO;

public interface LaporanService {
    Integer getTotalPeminjaman();

    Integer getTotalPengembalian();

    List<BukuTerpopulerDTO> getBukuPalingBanyakDipinjam();

    List<SiswaTerlambatDTO> getSiswaSeringTelat();

    Integer getTotalDendaKeseluruhan();

    List<BukuTerpopulerDTO> getBukuTerpopuler(LocalDate startDate, LocalDate endDate);

    List<SiswaTerlambatDTO> getSiswaPalingSeringTerlambat(LocalDate startDate, LocalDate endDate);
}
