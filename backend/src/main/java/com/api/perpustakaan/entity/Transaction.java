package com.api.perpustakaan.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.api.perpustakaan.constant.ReturnStatusConstant;
import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.constant.TypesOfFinesConstant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Transaksi peminjaman")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_siswa")
    private User student;

    @ManyToOne
    @JoinColumn(name = "id_buku")
    private Book book;

    @Column(name = "tanggal_pinjam")
    private LocalDate tanggalPinjam;

    @Column(name = "tanggal_jatuh_tempo")
    private LocalDate tanggalJatuhTempo;

    @Column(name = "tanggal_kembali")
    private LocalDate tanggalKembali;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private StatusConstant status;

    @Enumerated(EnumType.STRING)
    @Column(name = "status_kembali")
    private ReturnStatusConstant statusKembali;

    private Integer denda;

    @Enumerated(EnumType.STRING)
    @Column(name = "denda_jenis")
    private TypesOfFinesConstant dendaJenis;

    @Column(name = "denda_total")
    private Integer dendaTotal;

    @Column(columnDefinition = "TEXT")
    private String catatan;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "rating")
    private Integer rating;
}
