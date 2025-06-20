package com.api.perpustakaan.entity;

import java.time.LocalDateTime;

import com.api.perpustakaan.constant.RoleConstant;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user")
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "nama")
    private String name;

    @Column(name = "username")
    private String username;

    @Column(name = "password")
    private String password;

    @Column(name = "email")
    private String email;

    @Column(name = "nip")
    private String nip;

    @Column(name = "nis")
    private String nis;

    @Column(name = "kelas")
    private String userClass;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private RoleConstant role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
