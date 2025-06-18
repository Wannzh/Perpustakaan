package com.api.perpustakaan.controller.admin;

import com.api.perpustakaan.dto.pustakawan.*;
import com.api.perpustakaan.service.user.UserManagementService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserManagementService userManagementService;

    @PostMapping("/pustakawan/tambah")
    public ResponseEntity<PustakawanResponseDTO> createPustakawan(@RequestBody PustakawanRequestDTO request) {
        return ResponseEntity.ok(userManagementService.createPustakawan(request));
    }

    @PutMapping("/pustakawan/edit/{id}")
    public ResponseEntity<PustakawanResponseDTO> updatePustakawan(
            @PathVariable Integer id,
            @RequestBody PustakawanRequestDTO request) {
        return ResponseEntity.ok(userManagementService.updatePustakawan(id, request));
    }

    @DeleteMapping("/pustakawan/hapus/{id}")
    public ResponseEntity<String> deletePustakawan(@PathVariable Integer id) {
        userManagementService.deletePustakawan(id);
        return ResponseEntity.ok("Pustakawan deleted successfully");
    }

    @GetMapping("/pustakawan/all")
    public ResponseEntity<List<PustakawanResponseDTO>> getAllPustakawan() {
        return ResponseEntity.ok(userManagementService.getAllPustakawan());
    }

    @GetMapping("/pustakawan/search/nama")
    public ResponseEntity<List<PustakawanResponseDTO>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(userManagementService.searchPustakawanByName(name));
    }

    @GetMapping("/pustakawan/search/nip")
    public ResponseEntity<List<PustakawanResponseDTO>> searchByNip(@RequestParam String nip) {
        return ResponseEntity.ok(userManagementService.searchPustakawanByNip(nip));
    }

    @Operation(
        summary = "Upload pustakawan via file",
        description = "Upload file Excel (.xlsx) atau CSV untuk menambahkan pustakawan secara massal"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Upload berhasil"),
        @ApiResponse(responseCode = "400", description = "Upload gagal")
    })
    @PostMapping(value = "/pustakawan/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadPustakawanBatch(
        @Parameter(
            description = "File Excel (.xlsx) atau CSV",
            required = true,
            content = @Content(mediaType = "application/octet-stream",
                schema = @Schema(type = "string", format = "binary"))
        )
        @RequestParam("file") MultipartFile file
    ) {
        userManagementService.uploadPustakawanBatch(file);
        return ResponseEntity.ok("Batch upload successful");
    }
}
