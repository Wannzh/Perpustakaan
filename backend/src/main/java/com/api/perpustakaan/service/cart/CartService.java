package com.api.perpustakaan.service.cart;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;

import com.api.perpustakaan.dto.cart.CartRequestDTO;
import com.api.perpustakaan.dto.cart.CartResponseDTO;

public interface CartService {
    ResponseEntity<?> addToCart(UUID siswaId, CartRequestDTO request);
    ResponseEntity<?> removeFromCart(UUID siswaId, Integer bookId);
    List<CartResponseDTO> getCart(UUID siswaId);
}
