package com.api.perpustakaan.controller.admin;

import com.api.perpustakaan.dto.pustakawan.*;
import com.api.perpustakaan.service.user.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserManagementService userManagementService;

    @PostMapping("/add/pustakawan")
    public ResponseEntity<PustakawanResponseDTO> createPustakawan(@RequestBody PustakawanRequestDTO request) {
        return ResponseEntity.ok(userManagementService.createPustakawan(request));
    }

    @PutMapping("/edit/pustakawan/{id}")
    public ResponseEntity<PustakawanResponseDTO> updatePustakawan(
            @PathVariable Integer id,
            @RequestBody PustakawanRequestDTO request) {
        return ResponseEntity.ok(userManagementService.updatePustakawan(id, request));
    }

    @DeleteMapping("/delete/pustakawan/{id}")
    public ResponseEntity<String> deletePustakawan(@PathVariable Integer id) {
        userManagementService.deletePustakawan(id);
        return ResponseEntity.ok("Pustakawan deleted successfully");
    }
}
