package com.api.perpustakaan.service;

import java.time.LocalDate;

public interface EmailService {
    void sendPeminjamanEmail(String to, String namaSiswa, String judulBuku,
            LocalDate tanggalJatuhTempo, Integer jumlahHariTerlambat,
            Integer totalDenda);
}
