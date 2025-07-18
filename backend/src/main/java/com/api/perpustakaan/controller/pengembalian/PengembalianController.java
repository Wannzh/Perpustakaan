package com.api.perpustakaan.controller.pengembalian;

import com.api.perpustakaan.dto.pengembalian.PengembalianRequestDTO;
import com.api.perpustakaan.service.pengembalian.PengembalianService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pengembalian")
public class PengembalianController {

    @Autowired
    private PengembalianService pengembalianService;

    @PutMapping("/manual")
    public ResponseEntity<?> prosesPengembalian(@Valid @RequestBody PengembalianRequestDTO request) {
        return pengembalianService.kembalikanBuku(request);
    }
}