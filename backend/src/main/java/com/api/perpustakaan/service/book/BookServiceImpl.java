package com.api.perpustakaan.service.book;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.api.perpustakaan.dto.book.BookRequestDTO;
import com.api.perpustakaan.dto.book.BookResponseDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.repository.book.BookRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {
    private final BookRepository bookRepository;

    @Override
    public BookResponseDTO createBook(BookRequestDTO request) {
        Book book = new Book();
        book.setJudul(request.getJudul());
        book.setPengarang(request.getPengarang());
        book.setPenerbit(request.getPenerbit());
        book.setTahunTerbit(request.getTahunTerbit());
        book.setKategori(request.getKategori());
        book.setJumlahEksemplar(request.getJumlahEksemplar());
        book.setStokTersedia(request.getJumlahEksemplar());
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());

        Book saved = bookRepository.save(book);

        return mapToResponse(saved);
    }

     @Override
    public BookResponseDTO updateBook(Integer id, BookRequestDTO request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        book.setJudul(request.getJudul());
        book.setPengarang(request.getPengarang());
        book.setPenerbit(request.getPenerbit());
        book.setTahunTerbit(request.getTahunTerbit());
        book.setKategori(request.getKategori());

        // Hitung ulang stok
        int delta = request.getJumlahEksemplar() - book.getJumlahEksemplar();
        book.setJumlahEksemplar(request.getJumlahEksemplar());
        book.setStokTersedia(book.getStokTersedia() + delta);
        book.setUpdatedAt(LocalDateTime.now());

        Book updated = bookRepository.save(book);
        return mapToResponse(updated);
    }

    @Override
    public void deleteBook(Integer id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));
        bookRepository.delete(book);
    }

    @Override
    public List<BookResponseDTO> getAllBooks() {
        System.out.println("masuk");
        return bookRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookResponseDTO> searchByJudul(String judul) {
        return bookRepository.findByJudulContainingIgnoreCase(judul).stream()
                .map(this::mapToResponse)
                .toList();
    }

    private BookResponseDTO mapToResponse(Book book) {
        return BookResponseDTO.builder()
                .id(book.getId())
                .judul(book.getJudul())
                .pengarang(book.getPengarang())
                .penerbit(book.getPenerbit())
                .tahunTerbit(book.getTahunTerbit())
                .kategori(book.getKategori())
                .jumlahEksemplar(book.getJumlahEksemplar())
                .stokTersedia(book.getStokTersedia())
                .build();
    }
}
