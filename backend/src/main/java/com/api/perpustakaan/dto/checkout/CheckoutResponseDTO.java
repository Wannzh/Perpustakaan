package com.api.perpustakaan.dto.checkout;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CheckoutResponseDTO {
    private List<String> berhasil; // judul buku yang berhasil dipinjam
    private List<String> gagal;    // judul buku yang gagal (stok habis)
    private int totalDipinjam;
}
