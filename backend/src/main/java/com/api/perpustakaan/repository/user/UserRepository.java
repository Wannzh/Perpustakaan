package com.api.perpustakaan.repository.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.constant.RoleConstant;
import com.api.perpustakaan.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    List<User> findByRole(RoleConstant role);

    // Pustakawan
    List<User> findByRoleAndNameContainingIgnoreCase(RoleConstant role, String name);
    List<User> findByRoleAndNipContainingIgnoreCase(RoleConstant role, String nip);

    // Siswa
    List<User> findByRoleAndNisContainingIgnoreCase(RoleConstant role, String nis);
}
