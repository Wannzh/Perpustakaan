package com.api.perpustakaan.repository.cart;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Cart;
import com.api.perpustakaan.entity.User;

public interface CartRepository extends JpaRepository<Cart, String> {
    List<Cart> findByStudent(User student);
    boolean existsByStudentAndBook(User student, Book book);
    void deleteByStudentAndBook(User student, Book book);
}
