package com.api.perpustakaan.repository.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
