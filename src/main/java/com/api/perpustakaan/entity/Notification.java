package com.api.perpustakaan.entity;

import java.time.LocalDateTime;

import com.api.perpustakaan.constant.NotificationType;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifikasi")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "id_siswa")
    private User user;

    @ManyToOne
    @JoinColumn(name = "id_transaksi")
    private Transaction transaction;

    @Enumerated(EnumType.STRING)
    @Column(name = "jenis", nullable = false)
    private NotificationType type;

    @Column(name = "status_kirim")
    private Boolean sendStatus;

    @Column(name = "waktu_kirim")
    private LocalDateTime sendTime;
}
