package com.api.perpustakaan.controller.siswa;

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
import java.util.UUID;

@RestController
@RequestMapping("/api/siswa")
@RequiredArgsConstructor
@Tag(name = "Pustakawan Kelola siswa", description = "Endpoints untuk mengelola siswa oleh pustakawan")
public class SiswaController {

    private final SiswaManagementService siswaManagementService;

    @PostMapping("/tambah")
    public ResponseEntity<SiswaResponseDTO> create(@RequestBody SiswaRequestDTO request) {
        return ResponseEntity.ok(siswaManagementService.createSiswa(request));
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<SiswaResponseDTO> update(@PathVariable UUID id, @RequestBody SiswaRequestDTO request) {
        return ResponseEntity.ok(siswaManagementService.updateSiswa(id, request));
    }

    @DeleteMapping("/hapus/{id}")
    public ResponseEntity<String> delete(@PathVariable UUID id) {
        siswaManagementService.deleteSiswa(id);
        return ResponseEntity.ok("Siswa deleted successfully");
    }

    @GetMapping("/all")
    public ResponseEntity<List<SiswaResponseDTO>> getAll() {
        return ResponseEntity.ok(siswaManagementService.getAllSiswa());
    }

    @GetMapping("/search/nama")
    public ResponseEntity<List<SiswaResponseDTO>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(siswaManagementService.searchSiswaByName(name));
    }

    @GetMapping("/search/nis")
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
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateAktifStatus(
            @PathVariable UUID id,
            @RequestParam boolean active
    ) {
        siswaManagementService.updateStatusAktif(id, active);
        return ResponseEntity.ok().build();
    }
}