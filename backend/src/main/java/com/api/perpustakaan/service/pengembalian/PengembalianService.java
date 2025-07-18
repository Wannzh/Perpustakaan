package com.api.perpustakaan.service.pengembalian;

import org.springframework.http.ResponseEntity;

import com.api.perpustakaan.dto.pengembalian.PengembalianRequestDTO;

public interface PengembalianService {
    ResponseEntity<?> kembalikanBuku(PengembalianRequestDTO request);
}
