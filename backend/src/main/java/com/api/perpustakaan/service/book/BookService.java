package com.api.perpustakaan.service.book;

import java.util.List;

import com.api.perpustakaan.dto.book.BookRequestDTO;
import com.api.perpustakaan.dto.book.BookResponseDTO;

public interface BookService {
    BookResponseDTO createBook(BookRequestDTO request);
    BookResponseDTO updateBook(Integer id, BookRequestDTO request);
    void deleteBook(Integer id);
    List<BookResponseDTO> getAllBooks();
    List<BookResponseDTO> searchByJudul(String judul);
}
