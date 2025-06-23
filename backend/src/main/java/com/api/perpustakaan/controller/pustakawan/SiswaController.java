package com.api.perpustakaan.controller.pustakawan;

import com.api.perpustakaan.dto.siswa.*;
import com.api.perpustakaan.service.siswa.SiswaManagementService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pustakawan")
@RequiredArgsConstructor
@Tag(name = "Pustakawan Kelola siswa", description = "Endpoints untuk mengelola siswa oleh pustakawan")
public class SiswaController {

    private final SiswaManagementService siswaManagementService;

    @PostMapping("/siswa/tambah")
    public ResponseEntity<SiswaResponseDTO> create(@RequestBody SiswaRequestDTO request) {
        return ResponseEntity.ok(siswaManagementService.createSiswa(request));
    }

    @PutMapping("/siswa/edit/{id}")
    public ResponseEntity<SiswaResponseDTO> update(@PathVariable Integer id, @RequestBody SiswaRequestDTO request) {
        return ResponseEntity.ok(siswaManagementService.updateSiswa(id, request));
    }

    @DeleteMapping("/siswa/hapus/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        siswaManagementService.deleteSiswa(id);
        return ResponseEntity.ok("Siswa deleted successfully");
    }

    @GetMapping("/siswa/all")
    public ResponseEntity<List<SiswaResponseDTO>> getAll() {
        return ResponseEntity.ok(siswaManagementService.getAllSiswa());
    }

    @GetMapping("/siswa/search/nama")
    public ResponseEntity<List<SiswaResponseDTO>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(siswaManagementService.searchSiswaByName(name));
    }

    @GetMapping("/siswa/search/nis")
    public ResponseEntity<List<SiswaResponseDTO>> searchByNis(@RequestParam String nis) {
        return ResponseEntity.ok(siswaManagementService.searchSiswaByNis(nis));
    }

    @Operation(
        summary = "Upload siswa via file",
        description = "Upload file Excel (.xlsx) atau CSV untuk menambahkan siswa secara massal"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Upload berhasil"),
        @ApiResponse(responseCode = "400", description = "Upload gagal")
    })
    @PostMapping(value = "/siswa/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadBatch(@Parameter(
            description = "File Excel (.xlsx) atau CSV",
            required = true,
            content = @Content(mediaType = "application/octet-stream",
                schema = @Schema(type = "string", format = "binary"))
        )
        @RequestParam("file") MultipartFile file
    ) {
        siswaManagementService.uploadSiswaBatch(file);
        return ResponseEntity.ok("Upload batch siswa berhasil");
    }
}