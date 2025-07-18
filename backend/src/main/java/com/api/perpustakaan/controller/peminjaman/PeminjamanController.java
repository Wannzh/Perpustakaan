package com.api.perpustakaan.controller.peminjaman;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanRequestSelfDTO;
import com.api.perpustakaan.dto.peminjaman.PeminjamanResponseDTO;
import com.api.perpustakaan.service.peminjaman.PeminjamanService;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/peminjaman")
@RequiredArgsConstructor
@Tag(name = "Peminjaman", description = "Endpoints untuk mengelola peminjaman yang bisa di akses oleh pustakawan dan siswa")
public class PeminjamanController {
    private final PeminjamanService peminjamanService;

    @PostMapping("/manual/tambah")
    public ResponseEntity<PeminjamanResponseDTO> createManual(@RequestBody PeminjamanRequestDTO request) {
        return ResponseEntity.ok(peminjamanService.createManual(request));
    }

    @PostMapping("/self/tambah")
    public ResponseEntity<PeminjamanResponseDTO> pinjamMandiri(
            @RequestBody PeminjamanRequestSelfDTO request,
            @RequestAttribute("username") String username
    ) {
        return ResponseEntity.ok(peminjamanService.createSelfPeminjaman(username, request));
    }
}
