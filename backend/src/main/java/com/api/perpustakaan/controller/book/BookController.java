package com.api.perpustakaan.controller.book;

import com.api.perpustakaan.dto.book.*;
import com.api.perpustakaan.service.book.BookService;

// import io.swagger.v3.oas.annotations.security.SecurityRequirement;
// import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @PostMapping(value = "/tambah", consumes = "multipart/form-data")
    public ResponseEntity<BookResponseDTO> createBook(@ModelAttribute BookRequestDTO request) {
        return ResponseEntity.ok(bookService.createBook(request));
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<BookResponseDTO> update(@PathVariable Integer id, @ModelAttribute BookRequestDTO request) {
        return ResponseEntity.ok(bookService.updateBook(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok("Book deleted successfully");
    }

    @GetMapping("get-all")
    public ResponseEntity<List<BookResponseDTO>> getAll() {
        System.out.println("masuk ke controller");
        return ResponseEntity.ok(bookService.getAllBooks());
    }

    @GetMapping("/search")
    public ResponseEntity<List<BookResponseDTO>> searchByJudul(@RequestParam String judul) {
        return ResponseEntity.ok(bookService.searchByJudul(judul));
    }
}
