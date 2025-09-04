package com.api.perpustakaan.service.cart;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.api.perpustakaan.constant.StatusConstant;
import com.api.perpustakaan.dto.cart.CartRequestDTO;
import com.api.perpustakaan.dto.cart.CartResponseDTO;
import com.api.perpustakaan.dto.checkout.CheckoutResponseDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Cart;
import com.api.perpustakaan.entity.Transaction;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.book.BookRepository;
import com.api.perpustakaan.repository.cart.CartRepository;
import com.api.perpustakaan.repository.transaction.TransactionRepository;
import com.api.perpustakaan.repository.user.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public ResponseEntity<?> addToCart(UUID siswaId, CartRequestDTO request) {
        User student = userRepository.findById(siswaId)
                .orElseThrow(() -> new RuntimeException("Siswa tidak ditemukan"));

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        if (cartRepository.existsByStudentAndBook(student, book)) {
            return ResponseEntity.badRequest().body("Buku sudah ada di keranjang.");
        }

        Cart cart = Cart.builder()
                .student(student)
                .book(book)
                .createdAt(LocalDateTime.now())
                .build();

        cartRepository.save(cart);
        return ResponseEntity.ok("Buku berhasil ditambahkan ke keranjang.");
    }

    @Override
    public ResponseEntity<?> removeFromCart(UUID siswaId, Integer bookId) {
        User student = userRepository.findById(siswaId)
                .orElseThrow(() -> new RuntimeException("Siswa tidak ditemukan"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Buku tidak ditemukan"));

        cartRepository.deleteByStudentAndBook(student, book);
        return ResponseEntity.ok("Buku dihapus dari keranjang.");
    }

    @Override
    public List<CartResponseDTO> getCart(UUID siswaId) {
        User student = userRepository.findById(siswaId)
                .orElseThrow(() -> new RuntimeException("Siswa tidak ditemukan"));

        String baseUrl = "http://localhost:8080";

        return cartRepository.findByStudent(student).stream()
                .map(cart -> {
                    CartResponseDTO dto = new CartResponseDTO();
                    Book book = cart.getBook();

                    dto.setId(cart.getId());
                    dto.setBookId(cart.getBook().getId());
                    dto.setJudul(cart.getBook().getJudul());
                    dto.setPengarang(cart.getBook().getPengarang());
                    if (book.getCoverImage() != null && !book.getCoverImage().isBlank()) {
                        dto.setCoverImage(baseUrl + book.getCoverImage());
                    } else {
                        dto.setCoverImage(baseUrl + "/uploads/covers/default.png");
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // New Add Checkout
    @Transactional
    @Override
    public ResponseEntity<?> checkout(UUID siswaId) {
        List<Cart> carts = cartRepository.findByStudentId(siswaId);

        if (carts.isEmpty()) {
            return ResponseEntity.badRequest().body("Keranjang kosong.");
        }

        List<Transaction> transaksiList = new ArrayList<>();
        List<String> berhasil = new ArrayList<>();
        List<String> gagal = new ArrayList<>();

        for (Cart cart : carts) {
            Book book = cart.getBook();
            if (book.getStokTersedia() <= 0) {
                gagal.add(book.getJudul());
                continue; // skip kalau stok habis
            }

            Transaction transaksi = new Transaction();
            transaksi.setStudent(cart.getStudent());
            transaksi.setBook(book);
            transaksi.setTanggalPinjam(LocalDate.now());
            transaksi.setTanggalJatuhTempo(LocalDate.now().plusDays(7));
            transaksi.setStatus(StatusConstant.DIPINJAM);
            transaksi.setCreatedAt(LocalDateTime.now());
            transaksi.setUpdatedAt(LocalDateTime.now());

            transaksiList.add(transaksi);
            berhasil.add(book.getJudul());

            // update stok
            book.setStokTersedia(book.getStokTersedia() - 1);
            bookRepository.save(book);
        }

        if (transaksiList.isEmpty()) {
            return ResponseEntity.badRequest().body("Tidak ada buku yang bisa dipinjam (stok habis).");
        }

        transactionRepository.saveAll(transaksiList);
        cartRepository.deleteAll(carts); // kosongkan keranjang

        CheckoutResponseDTO response = new CheckoutResponseDTO(
                berhasil,
                gagal,
                berhasil.size());

        return ResponseEntity.ok(response);
    }

}
