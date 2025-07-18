package com.api.perpustakaan.controller.pengembalian;

import com.api.perpustakaan.dto.pengembalian.PengembalianRequestDTO;
import com.api.perpustakaan.service.pengembalian.PengembalianService;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pengembalian")
@Tag(name = "Pengembalian", description = "Endpoints untuk mengelola pengembalian yang bisa di akses oleh pustakawan dan siswa")
public class PengembalianController {

    @Autowired
    private PengembalianService pengembalianService;

    @PutMapping("/manual")
    public ResponseEntity<?> prosesPengembalian(@Valid @RequestBody PengembalianRequestDTO request) {
        return pengembalianService.kembalikanBuku(request);
    }

    @PostMapping("/self")
    public ResponseEntity<?> kembalikanMandiri(
            @RequestBody @Valid PengembalianRequestDTO request,
            HttpServletRequest servletRequest) {

        // Ambil userId dari JWT yang disimpan oleh JwtFilter
        Integer siswaId = (Integer) servletRequest.getAttribute("userId");

        if (siswaId == null) {
            return ResponseEntity.status(401).body("Unauthorized: userId tidak ditemukan dalam token.");
        }

        return pengembalianService.kembalikanBukuMandiri(request, siswaId);
    }
}