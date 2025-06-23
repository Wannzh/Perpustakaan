package com.api.perpustakaan.repository.book;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.perpustakaan.entity.Book;

public interface BookRepository extends JpaRepository<Book, Integer> {
    List<Book> findByJudulContainingIgnoreCase(String judul);
}
