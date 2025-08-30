package com.api.perpustakaan.service.pengembalian;

import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.api.perpustakaan.dto.pengembalian.PengembalianRequestDTO;

public interface PengembalianService {
    ResponseEntity<?> kembalikanBuku(PengembalianRequestDTO request);
    ResponseEntity<?> kembalikanBukuMandiri(PengembalianRequestDTO request, UUID siswaId);
    ResponseEntity<?> konfirmasiPengembalian(Integer transactionId, boolean disetujui);
}
