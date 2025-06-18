package com.api.perpustakaan.controller.admin;

import com.api.perpustakaan.dto.pustakawan.*;
import com.api.perpustakaan.service.user.UserManagementService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

}
