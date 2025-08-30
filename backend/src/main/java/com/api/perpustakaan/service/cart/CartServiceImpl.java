package com.api.perpustakaan.service.cart;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.api.perpustakaan.dto.cart.CartRequestDTO;
import com.api.perpustakaan.dto.cart.CartResponseDTO;
import com.api.perpustakaan.entity.Book;
import com.api.perpustakaan.entity.Cart;
import com.api.perpustakaan.entity.User;
import com.api.perpustakaan.repository.book.BookRepository;
import com.api.perpustakaan.repository.cart.CartRepository;
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

        return cartRepository.findByStudent(student).stream()
                .map(cart -> {
                    CartResponseDTO dto = new CartResponseDTO();
                    dto.setId(cart.getId());
                    dto.setBookId(cart.getBook().getId());
                    dto.setJudul(cart.getBook().getJudul());
                    dto.setPengarang(cart.getBook().getPengarang());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
