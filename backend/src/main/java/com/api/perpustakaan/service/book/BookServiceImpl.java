package com.api.perpustakaan.service.book;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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
        try {
            // Simpan file cover ke folder lokal
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

            if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + request.getCoverImage().getOriginalFilename();
                String uploadDir = "uploads/covers/"; // folder di server
                java.nio.file.Path path = java.nio.file.Paths.get(uploadDir + fileName);

                java.nio.file.Files.createDirectories(path.getParent());
                request.getCoverImage().transferTo(path);

                book.setCoverImage("/uploads/covers/" + fileName);
            } else {
                book.setCoverImage(null); // atau set ke gambar default jika ada
            }

            Book saved = bookRepository.save(book);
            return mapToResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("Gagal upload cover image", e);
        }
    }

    @Override
    public BookResponseDTO updateBook(Integer id, BookRequestDTO request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        if (request.getCoverImage() != null && !request.getCoverImage().isEmpty()) {
            try {
                // (Opsional tapi direkomendasikan) Hapus file gambar lama jika ada
                if (book.getCoverImage() != null && !book.getCoverImage().isBlank()) {
                    Path oldImagePath = Paths.get("." + book.getCoverImage()); // Titik di awal untuk path relatif
                    Files.deleteIfExists(oldImagePath);
                }

                // Simpan file gambar yang baru
                String fileName = System.currentTimeMillis() + "_" + request.getCoverImage().getOriginalFilename();
                String uploadDir = "uploads/covers/";
                Path newImagePath = Paths.get(uploadDir + fileName);
                Files.createDirectories(newImagePath.getParent());
                request.getCoverImage().transferTo(newImagePath);

                book.setCoverImage("/uploads/covers/" + fileName); // Perbarui path gambar di database

            } catch (Exception e) {
                // Sebaiknya gunakan logger di sini
                throw new RuntimeException("Gagal memperbarui cover image", e);
            }
        }

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
        String baseUrl = "http://localhost:8080";
        String coverUrl;

        if (book.getCoverImage() != null && !book.getCoverImage().isBlank()) {
            coverUrl = baseUrl + book.getCoverImage();
        } else {
            coverUrl = baseUrl + "/uploads/covers/default.png";
        }
        return BookResponseDTO.builder()
                .id(book.getId())
                .judul(book.getJudul())
                .pengarang(book.getPengarang())
                .penerbit(book.getPenerbit())
                .tahunTerbit(book.getTahunTerbit())
                .kategori(book.getKategori())
                .jumlahEksemplar(book.getJumlahEksemplar())
                .stokTersedia(book.getStokTersedia())
                .coverImage(coverUrl)
                .build();
    }
}
