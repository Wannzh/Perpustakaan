package com.api.perpustakaan.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "buku")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    private String judul;

    private String pengarang;

    private String penerbit;

    @Column(name = "tahun_terbit")
    private Integer tahunTerbit;

    private String kategori;

    @Column(name = "jumlah_eksemplar")
    private Integer jumlahEksemplar;

    @Column(name = "stok_tersedia")
    private Integer stokTersedia;

    // path cover image
    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
